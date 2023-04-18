import { randInt, randomElement } from './utils.js'

export class Process {
  private currentWorkload = 0
  get workload() {
    return this.currentWorkload
  }
  get active() {
    return this.lifetime > 0
  }

  constructor (
    readonly name: string,
    private lifetime: number,
    private readonly averageWorkload: number,
    private readonly workloadRange: number
  ) {}

  execute() {
    if (!this.active) return
    const range = randInt(-this.workloadRange, this.workloadRange)
    this.currentWorkload = this.averageWorkload + range
    this.lifetime--
  }
}

class ProcessGenerator {
  private readonly names = ['virus', 'app', 'script', 'main', 'server', 'daemon', 'node', 'program']
  private readonly extensions = ['.js', '.py', '.exe', '.rb', '.sh', '.exs', '.jl']

  private getRandomName() {
    const name = randomElement(this.names)
    const postfix = randInt(1, 9)
    const extension = randomElement(this.extensions)
    return `${name}${postfix}${extension}`
  }

  private readonly workloadRange = [2, 10] as const
  private readonly workloadSpreadRange = [1, 3] as const
  private readonly lifetimeRange = [100, 250] as const

  getRandomProcess() {
    const name = this.getRandomName()
    const lifetime = randInt(...this.lifetimeRange)
    const workload = randInt(...this.workloadRange)
    const spread = randInt(...this.workloadSpreadRange)
    return new Process(name, lifetime, workload, spread)
  }
}

export const generator = new ProcessGenerator