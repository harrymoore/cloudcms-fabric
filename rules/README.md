	
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

## Copy keywords
Copy the project-type specific keyword list to the common property "keywords"

Rule title: "keywords"

Policy: p:afterTouchNode
Scope: Content Type
Type: fabric:project

Conditions: n/a

Action: Execute Script action
Action config:
{
	"script": "if (typeof(node.data.keywords1) !== 'undefined') { node.data.keywords = node.data.keywords1.map(x => x.title) } else if (typeof(node.data.keywords2) !== 'undefined') { node.data.keywords = node.data.keywords2.map(x => x.title) } else if (typeof(node.data.keywords3) !== 'undefined') { node.data.keywords = node.data.keywords3.map(x => x.title) } else if (typeof(node.data.keywords4) !== 'undefined') { node.data.keywords = node.data.keywords4.map(x => x.title) }"

}