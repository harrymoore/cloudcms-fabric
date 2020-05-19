# id-field
Implement an id field which copies the node's _doc property and displays it as read only.

example blacklist usage in a form field:
    "id": {
        "type": "id",
        "minLength": 6,
        "label": "Identifier",
        "readonly": true
    }
