from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    username = fields.String(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))

class LoginSchema(Schema):
    username_or_email = fields.String(required=True)
    password = fields.String(required=True)
