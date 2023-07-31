
/**
 * Finds out if the node belongs to the Element
 * 
 * @param node Node
 * @returns True if the node is an element
 */
export function isElementNode(node: Node): node is Element {
    return node.nodeType === node.ELEMENT_NODE;
}

/**
 * Finds out if the node belongs to the Document
 * 
 * @param node 
 * @returns True if the node is an element
 */
export function isDocumentNode(node: Node): node is Document {
    return node.nodeType === node.DOCUMENT_NODE;
}

/**
 * Finds out if the node belongs to the DocumentFragment
 * 
 * @param node 
 * @returns True if the node is an element
 */
export function isDocumentFragmentNode(node: Node): node is DocumentFragment {
    return node.nodeType === node.DOCUMENT_FRAGMENT_NODE;
}