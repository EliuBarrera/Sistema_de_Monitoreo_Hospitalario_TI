from models.device_model import Device
from services.device_types_service import *
from extensions import db
import requests

LOCATIONS_SERVICE_URL = 'http://localhost:5004/locations'

def get_location_data(location_id):
    try:
        response = requests.get(f'{LOCATIONS_SERVICE_URL}/{location_id}')
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": "Error when asking for the location"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Error to try connect with the locations service: {str(e)}"}, 500 

def validate_location(location_id):
    try:
        response = requests.get(f"{LOCATIONS_SERVICE_URL}/{location_id}")

        if response.status_code == 200:
            return True
        if response.status_code == 404:
            return False
        
        return False
    except requests.exceptions.RequestException:
        return None; # Fall service

# READ
def get_all_devices():
    devices = Device.query.order_by(Device.id.asc()).all()
    result = []

    for device in devices:
        location = get_location_data(device.location_id)        
        device_type = get_device_type_data(device.device_type_id)

        result.append({
            'id': device.id,
            'name': device.name,
            'ip_address': device.ip_address,
            'mac_address': device.mac_address,
            'brand': device.brand,
            'device_type': device_type,
            'location': location,
            'status': device.status,
            'model': device.model,
            'serial_number': device.serial_number,
            'intstalled_date': device.intstalled_date,
            'last_seen': device.last_seen
            }
        )
    
    return result

def get_device_by_id(device_id):
    device = Device.query.get(device_id)
    
    if not device:
        return {"error": "device not found"}, 404
    
    location = get_location_data(device.location_id)
    device_type = get_device_type_data(device.device_type_id)

    return {
        'id': device.id,
        'name': device.name,
        'ip_address': device.ip_address,
        'mac_address': device.mac_address,
        'brand': device.brand,
        'device_type': device_type,
        'location': location,
        'status': device.status,
        'model': device.model,
        'serial_number': device.serial_number,
        'intstalled_date': device.intstalled_date,
        'last_seen': device.last_seen
    }

# CREATE
def create_device(data):
    location_id = data.get('location_id')
    device_type_id = data.get('device_type_id')

    location = validate_location(location_id)
    device_type = get_device_type_data(device_type_id)

    if not location or not device_type:
        return {"error": "location or device_type not found"}, 404

    new_device = Device(
        name=data.get('name'),
        ip_address=data.get('ip_address'),
        mac_address=data.get('mac_address'),
        brand=data.get('brand'),
        device_type_id=device_type_id,
        location_id=location_id,
        status=data.get('status'),
        model=data.get('model'),
        serial_number=data.get('serial_number'),
        intstalled_date=data.get('intstalled_date'),
        last_seen=data.get('last_seen')
    )

    db.session.add(new_device)
    db.session.commit()

    return serialize_device(new_device), 201
        
# UPDATE
def update_device(device_id, data):
    device = Device.query.get(device_id)
    
    if not device:
        return {"error": "device not found"}, 404
    
    location_id = data.get('location_id')
    device_type_id = data.get('device_type_id')

    if location_id and device_type_id:
        location = validate_location(location_id)
        device_type = get_device_type_data(device_type_id)
        
        if location is None:
            return {"error": "Location service unvailable"}, 500
        
        if not location:
            return {"error": "Location not found"}, 404

        if not device_type:
            return {"error": "Device type not found"}, 404

        device.name = data['name']
        device.ip_address = data['ip_address']
        device.mac_address = data['mac_address']
        device.brand = data['brand']
        device.device_type_id = device_type_id
        device.location_id = location_id
        device.status = data['status']
        device.model = data['model']
        device.serial_number = data['serial_number']
        device.intstalled_date = data['intstalled_date']
        device.last_seen = data['last_seen']

        db.session.commit()
        return serialize_device(device), 200

def serialize_device(device):
    return {
        'id': device.id,
        'name': device.name,
        'ip_address': device.ip_address,
        'mac_address': device.mac_address,
        'brand': device.brand,
        'device_type_id': device.device_type_id,
        'location_id': device.location_id,
        'status': device.status,
        'model': device.model,
        'serial_number': device.serial_number,
        'intstalled_date': device.intstalled_date,
        'last_seen': device.last_seen
    }