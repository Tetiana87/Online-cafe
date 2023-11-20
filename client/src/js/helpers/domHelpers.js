export function createElement(
  tagName,
  content,
  attributes,
  eventHandlers,
  parent,
  productId
) {
  const element = document.createElement(tagName);

  if (content) {
    if (typeof content === "string") {
      element.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      element.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach((item) => {
        if (item instanceof HTMLElement) {
          element.appendChild(item);
        }
      });
    }
  }

  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
  }

  if (eventHandlers) {
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(eventName, handler);
    }
  }

  if (parent) {
    parent.appendChild(element);
  }

  if (productId) {
    for (const key in productId) {
      element.dataset[key] = productId[key];
    }
  }

  return element;
}
