#!/usr/bin/env bash
# ============================================================
#  start_services.sh  –  Arranca todos los microservicios
#  en terminales dedicadas (tabs o ventanas de tmux/gnome/etc.)
# ============================================================

# ── Configuración ────────────────────────────────────────────
# Ajusta BASE_DIR al directorio raíz del proyecto si es diferente
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Mapa: nombre → ruta relativa desde BASE_DIR
declare -A SERVICES=(
  ["gateway"]="../gateway/app.py"
  ["auth_service"]="../auth_service/app.py"
  ["users_service"]="../users_service/app.py"
  ["devices_service"]="../devices_service/app.py"
  ["locations_service"]="../locations_service/app.py"
  ["metrics_service"]="../metrics_service/app.py"
  ["alerts_service"]="../alerts_service/app.py"
)

# Puertos (solo para el mensaje de arranque, Flask los toma de cada app.py)
declare -A PORTS=(
  ["gateway"]="5000"
  ["auth_service"]="5001"
  ["users_service"]="5002"
  ["devices_service"]="5003"
  ["locations_service"]="5004"
  ["metrics_service"]="5005"
  ["alerts_service"]="5006"
)

# Color helpers
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

# ── Detección de emulador de terminal disponible ─────────────
detect_terminal() {
  for t in gnome-terminal konsole xterm xfce4-terminal lxterminal tilix; do
    command -v "$t" &>/dev/null && echo "$t" && return
  done
  echo "none"
}

# ── Función: abrir una nueva ventana/tab con el servicio ─────
open_terminal_for_service() {
  local name="$1"
  local script_path="$2"
  local port="$3"
  local term="$4"

  local full_path="$BASE_DIR/$script_path"
  local work_dir
  work_dir="$(dirname "$full_path")"

  if [ ! -f "$full_path" ]; then
    echo -e "${YELLOW}⚠  Servicio '${name}': archivo no encontrado → ${full_path}${RESET}"
    return
  fi

  local cmd="cd '$work_dir' && echo -e '\033[1;36m[ $name ] Puerto $port\033[0m' && python app.py; echo -e '\033[1;31m[ $name ] proceso terminado – presiona Enter para cerrar\033[0m'; read"

  case "$term" in
    gnome-terminal)
      gnome-terminal --tab --title="$name :$port" -- bash -c "$cmd" &;;
    konsole)
      konsole --new-tab -p tabtitle="$name :$port" -e bash -c "$cmd" &;;
    xfce4-terminal)
      xfce4-terminal --tab --title="$name :$port" -e "bash -c \"$cmd\"" &;;
    tilix)
      tilix -a session-add-right --title="$name :$port" -e "bash -c \"$cmd\"" &;;
    xterm)
      xterm -title "$name :$port" -e bash -c "$cmd" &;;
    lxterminal)
      lxterminal --title="$name :$port" -e "bash -c \"$cmd\"" &;;
  esac
}

# ── Modo tmux (sin entorno gráfico) ──────────────────────────
start_with_tmux() {
  local session="microservices"

  if tmux has-session -t "$session" 2>/dev/null; then
    echo -e "${YELLOW}Ya existe la sesión tmux '${session}'. Usa: tmux attach -t ${session}${RESET}"
    exit 0
  fi

  tmux new-session -d -s "$session" -n "gateway"

  local first=true
  for name in "${!SERVICES[@]}"; do
    local script_path="${SERVICES[$name]}"
    local full_path="$BASE_DIR/$script_path"
    local work_dir
    work_dir="$(dirname "$full_path")"
    local port="${PORTS[$name]}"

    if [ ! -f "$full_path" ]; then
      echo -e "${YELLOW}⚠  '${name}': archivo no encontrado → ${full_path}${RESET}"
      continue
    fi

    if $first; then
      tmux send-keys -t "$session:gateway" \
        "cd '$work_dir' && echo '[ $name ] Puerto $port' && python app.py" Enter
      first=false
    else
      tmux new-window -t "$session" -n "$name"
      tmux send-keys -t "$session:$name" \
        "cd '$work_dir' && echo '[ $name ] Puerto $port' && python app.py" Enter
    fi
  done

  echo -e "${GREEN}${BOLD}✔  Sesión tmux '${session}' iniciada.${RESET}"
  echo -e "   Adjúntate con: ${CYAN}tmux attach -t ${session}${RESET}"
  echo -e "   Navega entre ventanas: ${CYAN}Ctrl-b + número${RESET} o ${CYAN}Ctrl-b + n/p${RESET}"
}

# ── Modo "screen" (alternativa ligera a tmux) ────────────────
start_with_screen() {
  local session="microservices"

  for name in "${!SERVICES[@]}"; do
    local script_path="${SERVICES[$name]}"
    local full_path="$BASE_DIR/$script_path"
    local work_dir
    work_dir="$(dirname "$full_path")"
    local port="${PORTS[$name]}"

    if [ ! -f "$full_path" ]; then
      echo -e "${YELLOW}⚠  '${name}': no encontrado → ${full_path}${RESET}"
      continue
    fi

    screen -dmS "${session}_${name}" bash -c \
      "cd '$work_dir'; echo '[ $name ] Puerto $port'; python app.py; read"
    echo -e "${GREEN}✔  ${name}${RESET} corriendo en screen '${session}_${name}'"
  done

  echo ""
  echo -e "Adjúntate a un servicio con: ${CYAN}screen -r microservices_<nombre>${RESET}"
  echo -e "Lista de screens: ${CYAN}screen -ls${RESET}"
}

# ── Modo fallback: procesos en background con logs a archivo ──
start_background() {
  local log_dir="$BASE_DIR/logs"
  mkdir -p "$log_dir"

  for name in "${!SERVICES[@]}"; do
    local script_path="${SERVICES[$name]}"
    local full_path="$BASE_DIR/$script_path"
    local work_dir
    work_dir="$(dirname "$full_path")"
    local port="${PORTS[$name]}"
    local log_file="$log_dir/${name}.log"

    if [ ! -f "$full_path" ]; then
      echo -e "${YELLOW}⚠  '${name}': no encontrado → ${full_path}${RESET}"
      continue
    fi

    (cd "$work_dir" && python app.py > "$log_file" 2>&1) &
    echo -e "${GREEN}✔  ${name}${RESET} → PID $!  log: ${CYAN}${log_file}${RESET}"
  done

  echo ""
  echo -e "Todos los servicios corren en background."
  echo -e "Ver logs: ${CYAN}tail -f $BASE_DIR/logs/<servicio>.log${RESET}"
  echo -e "Ver todos: ${CYAN}tail -f $BASE_DIR/logs/*.log${RESET}"
}

# ── Main ─────────────────────────────────────────────────────
main() {
  echo -e "${BOLD}${CYAN}"
  echo "╔══════════════════════════════════════════╗"
  echo "║      🚀  Iniciando Microservicios        ║"
  echo "╚══════════════════════════════════════════╝"
  echo -e "${RESET}"

  # Prioridad: tmux > terminal gráfica > screen > background
  if command -v tmux &>/dev/null; then
    echo -e "Modo detectado: ${BOLD}tmux${RESET}"
    start_with_tmux
    return
  fi

  local term
  term="$(detect_terminal)"

  if [ "$term" != "none" ]; then
    echo -e "Modo detectado: ${BOLD}${term}${RESET}"
    echo ""
    for name in "${!SERVICES[@]}"; do
      open_terminal_for_service "$name" "${SERVICES[$name]}" "${PORTS[$name]}" "$term"
      echo -e "${GREEN}✔  ${name}${RESET} → abriendo en ${term} (puerto ${PORTS[$name]})"
    done
    return
  fi

  if command -v screen &>/dev/null; then
    echo -e "Modo detectado: ${BOLD}screen${RESET}"
    start_with_screen
    return
  fi

  echo -e "Modo detectado: ${BOLD}background (logs en ./logs/)${RESET}"
  start_background
}

main "$@"