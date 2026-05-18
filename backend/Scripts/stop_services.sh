#!/usr/bin/env bash
# ============================================================
#  stop_services.sh  –  Detiene todos los microservicios
# ============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
BOLD='\033[1m'; RESET='\033[0m'

echo -e "${BOLD}${RED}"
echo "╔══════════════════════════════════════════╗"
echo "║      🛑  Deteniendo Microservicios       ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${RESET}"

PORTS=(5000 5001 5002 5003 5004 5005 5006)

for port in "${PORTS[@]}"; do
  pid=$(lsof -ti ":$port" 2>/dev/null)
  if [ -n "$pid" ]; then
    kill -9 "$pid" 2>/dev/null
    echo -e "${RED}✖  Puerto ${port}${RESET} → PID ${pid} terminado"
  else
    echo -e "${CYAN}—  Puerto ${port}${RESET} ya estaba libre"
  fi
done

# Si hay sesión tmux activa
if command -v tmux &>/dev/null && tmux has-session -t "microservices" 2>/dev/null; then
  tmux kill-session -t "microservices"
  echo -e "${GREEN}✔  Sesión tmux 'microservices' cerrada${RESET}"
fi

# Si hay screens activos
if command -v screen &>/dev/null; then
  screen -ls 2>/dev/null | grep "microservices_" | awk '{print $1}' | while read -r s; do
    screen -X -S "$s" quit
    echo -e "${GREEN}✔  Screen '${s}' cerrado${RESET}"
  done
fi

echo ""
echo -e "${BOLD}Todos los servicios detenidos.${RESET}"
