export const slugerize = (input) => {
  return encodeURIComponent(input.replace(' ', '-'))
}
