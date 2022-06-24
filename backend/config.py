import configparser


def get_config():
    config = configparser.ConfigParser()
    config.read("config.cfg")
    return config


def get_value(group, value):
    config = get_config()
    return config.get(group, value)
