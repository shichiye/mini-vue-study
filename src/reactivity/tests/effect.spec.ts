import { effect } from "../effect"
import { reactive } from "../reactive"

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

    user.age++
    expect(nextAge).toBe(12)

  })

  it('should ruturn runner when call effect', () => {
    // 1. 调用effect后会返回function(runner)，可以再次执行传给effect的函数，并return返回值
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
    // 1. 通过effect的第二个参数指定一个 scheduler 的 fn
    // 2. effect第一次执行的时候会执行fn
    // 3. 当 响应式对象 更新set 的时候就不会执行 fn，而是scheduler
    // 4. 如果说当执行 runner 的时候，会再次 fn
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(() => {
      dummy = obj.foo
    }, {
      scheduler
    })

    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be callde on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  });
  
});
