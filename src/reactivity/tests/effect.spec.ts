import { reactive } from "../reactive"
import { effect, stop } from "../effect"

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    let nextAge

    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    // update
    user.age++
    expect(nextAge).toBe(12)
  })

  it('return runner when call effect', () => {
    // 1. effect(fn) -> function (runner) -> fn -> runner
    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })

    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })

  it('scheduler', () => {
    // 1. 通过 effect 的第二个参数传入 scheduler 函数
    // 2. effect 第一次执行时，会执行传入的 fn 函数
    // 3. 当 响应式对象 的属性更新的时候，就不会执行fn了，而是执行 scheduler
    // 4. 当执行 effect 返回的 runner 函数时，才会再次执行 fn
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(() => {
      dummy = obj.foo 
    }, { scheduler })
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called in first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })

  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1})
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    // obj.prop = 3

    // 触发了get操作，重新收集依赖
    obj.prop++
    expect(dummy).toBe(2)

    // stopped effect should be manually invoked
    runner()
    expect(dummy).toBe(3)
  })

  it('onStop', () => {
    const obj = reactive({
      foo: 1
    })
    const onStop = jest.fn()
    let dummy
    const runner = effect(() => {
        dummy = obj.foo
      },
      {
        onStop
      }
    )
    stop(runner)
    expect(onStop).toHaveBeenCalledTimes(1)
  })
})
