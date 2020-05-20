	
# Rules

## Set node id
Copy the Cloud CMS node's _doc property to the node's "id" property on create or update.

Rule title: "set id"

Policy: p:afterTouchNode
Scope: Content Type
Type: fabric:project

Conditions: n/a

Action: Execute Script action
Action config:
{
    "script": "if (typeof(node.data.id) === 'undefined') { node.data.id = node.data._doc }"	
}