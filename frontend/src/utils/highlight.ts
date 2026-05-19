export const highlightText = (text: string, keyword: string): string => {
  if (!keyword || !text) return text
  
  try {
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<span class="highlight">$1</span>')
  } catch {
    return text
  }
}

export const highlightHTML = (html: string, keyword: string): string => {
  if (!keyword || !html) return html
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_TEXT,
    null
  )
  
  const textNodes: Text[] = []
  let node: Node | null
  
  while ((node = walker.nextNode())) {
    if (node.textContent && node.textContent.toLowerCase().includes(keyword.toLowerCase())) {
      textNodes.push(node as Text)
    }
  }
  
  textNodes.forEach(textNode => {
    const text = textNode.textContent || ''
    const highlighted = highlightText(text, keyword)
    
    const span = document.createElement('span')
    span.innerHTML = highlighted
    
    textNode.parentNode?.replaceChild(span, textNode)
  })
  
  return tempDiv.innerHTML
}
