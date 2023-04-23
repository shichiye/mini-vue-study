import { extend, isObject } from "../shared"
import { track, trigger } from "./effect"
import { ReactiveFlags, reactive, readonly } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {

    if (key === ReactiveFlags.IS_REACTIVE /* IS_REACTIVE */) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY /* IS_READONLY */) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    if (shallow) {
      return res
    }

    // 看看res是不是一个对象，如果是对象，就递归调用reactive或者readonly
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
  
    if (!isReadonly) {
      track(target, key)
    }
    return res 
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)

    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,

  set: function set(target, key, value) {
    console.warn(`Set operation on key "${key}" failed: target is readonly.`, target)
    return true
  }
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
})
