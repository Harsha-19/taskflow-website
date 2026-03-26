from marshmallow import Schema, fields, validate

class ProjectSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    description = fields.String(allow_none=True)
    status = fields.String(validate=validate.OneOf(["active", "completed"]), load_default="active")

class ProjectUpdateSchema(Schema):
    name = fields.String(validate=validate.Length(min=1, max=100))
    description = fields.String(allow_none=True)
    status = fields.String(validate=validate.OneOf(["active", "completed"]))
