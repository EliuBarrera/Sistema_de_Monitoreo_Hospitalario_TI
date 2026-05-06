from models.device_types_model import DeviceType
from extensions import db
import requests

def get_all_device_types():
    device_types = DeviceType.query.order_by(DeviceType.id.asc()).all()
    return [serialize_device_type(device_type) for device_type in device_types], 200

def get_device_type_data(device_type_id):
    device_type = DeviceType.query.get(device_type_id)
    if not device_type:
        return None
    return serialize_device_type(device_type)


def serialize_device_type(device_type):
    return {
        'id': device_type.id,
        'name': device_type.name,
        'description': device_type.description,
        'category': device_type.category,
        'is_active': device_type.is_active
    }