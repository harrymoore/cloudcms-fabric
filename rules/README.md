	
# Rules

## Set node id
Copy the Cloud CMS node's _doc property to the node's "id" property and copy _system.created_on.timestamp to creationDate on create or update.

Rule title: "set id"

Policy: p:afterTouchNode
Scope: Content Type
Type: fabric:project

Conditions: n/a

Action: Execute Script action
Action config:
{
    "script": "if (typeof(node.data.id) === 'undefined') { node.data.id = node.data._doc; } if (typeof(node.data.creationDate) === 'undefined') { node.data.creationDate = node.data._system.created_on.timestamp; }"
}

## Change type to fabric:image in the /images folder

Rule title: "Change type to fabric:image"

Policy: n/a

Conditions: "Node Has attachment"
{
    "attachmentId": "default"
}

Action: Change Node Type
Action config:
{
    "type": "fabric:image"
}