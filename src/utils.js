export const object = obj => Object.assign(Object.create(null), obj)
export const frozenObject = obj => Object.freeze(object(obj))
