import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class RefImpl {
  private _value: any
  private _rawValue: any

  public dep

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
