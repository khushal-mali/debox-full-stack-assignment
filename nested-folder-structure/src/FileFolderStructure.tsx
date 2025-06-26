import React from "react";

interface Node {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: Node[];
}

const FolderStructure: React.FC = () => {
  const [nodes, setNodes] = React.useState<Node[]>([
    {
      id: "root",
      name: "root",
      type: "folder",
      children: [],
    },
  ]);

  const addNode = (parentId: string, name: string, type: "file" | "folder") => {
    // Check for duplicate name under the parent
    const hasDuplicate = (nodes: Node[], parentId: string, name: string): boolean => {
      const parentNode = nodes.find((node) => node.id === parentId);
      if (parentNode && parentNode.children) {
        return parentNode.children.some((child) => child.name === name);
      }
      return nodes.some((node) => {
        if (node.id === parentId) {
          return node.children?.some((child) => child.name === name) || false;
        }
        return node.children ? hasDuplicate(node.children, parentId, name) : false;
      });
    };

    if (hasDuplicate(nodes, parentId, name)) {
      alert(`A ${type} with the name "${name}" already exists in this folder.`);
      return;
    }

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      name,
      type,
      children: type === "folder" ? [] : undefined,
    };

    const updateNodes = (nodes: Node[]): Node[] => {
      return nodes.map((node) => {
        if (node.id === parentId && node.type === "folder") {
          return { ...node, children: [...(node.children || []), newNode] };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });
    };

    setNodes(updateNodes(nodes));
  };

  const deleteNode = (nodeId: string) => {
    const updateNodes = (nodes: Node[]): Node[] => {
      return nodes
        .filter((node) => node.id !== nodeId)
        .map((node) => {
          if (node.children) {
            return { ...node, children: updateNodes(node.children) };
          }
          return node;
        });
    };

    setNodes(updateNodes(nodes));
  };

  const renameNode = (nodeId: string, newName: string) => {
    const updateNodes = (nodes: Node[]): Node[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, name: newName.trim() };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });
    };

    setNodes(updateNodes(nodes));
  };

  const NodeComponent: React.FC<{ node: Node; depth: number }> = ({ node, depth }) => {
    const [newName, setNewName] = React.useState("");
    const [newType, setNewType] = React.useState<"file" | "folder">("file");
    const [isEditing, setIsEditing] = React.useState(false);
    const [editName, setEditName] = React.useState(node.name);

    const handleAdd = () => {
      if (newName.trim()) {
        addNode(node.id, newName, newType);
        setNewName("");
      }
    };

    const handleRename = () => {
      if (editName.trim()) {
        renameNode(node.id, editName);
        setIsEditing(false);
      }
    };

    return (
      <div style={{ marginLeft: `${depth * 20}px` }} className="my-1">
        <div className="flex items-center space-x-2">
          <span>{node.type === "folder" ? "📁" : "📄"}</span>
          {isEditing ? (
            <div className="flex space-x-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border rounded px-2 py-1"
                autoFocus
              />
              <button
                onClick={handleRename}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(node.name);
                }}
                className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <span>{node.name}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700"
              >
                Rename
              </button>
              {node.id !== "root" && (
                <button
                  onClick={() => deleteNode(node.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
        {node.type === "folder" && (
          <div className="ml-4">
            <div className="flex space-x-2 my-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New name"
                className="border rounded px-2 py-1"
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as "file" | "folder")}
                className="border rounded px-2 py-1"
              >
                <option value="file">File</option>
                <option value="folder">Folder</option>
              </select>
              <button
                onClick={handleAdd}
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            {node.children?.map((child) => (
              <NodeComponent key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Folder Structure</h2>
      {nodes.map((node) => (
        <NodeComponent key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
};

export default FolderStructure;
