import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class RefImpl {
  private _value: any
  private _rawValue: any

  public dep
  public __v_isRef = true

  constructor(value) {
    this._rawValue = value
    this._value = convert(value)

    this.dep = new Set()
  }

  get value() {

    trackRefValue(this)

    return this._value
  }

  set value(newValue) {

    if (hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }

  }
}

function convert(val) {
  return isObject(val) ? reactive(val) : val
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {

  return new Proxy(objectWithRefs, {
    get(target, key) {
      // 如果是ref类型，返回 .value
      // 否则返回本身
      return unRef(Reflect.get(target, key))
    },

    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}
