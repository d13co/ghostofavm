import { ABIMethod } from 'algosdk'
import { readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

// Change to the parent directory of where the script is located
process.chdir(dirname(dirname(fileURLToPath(import.meta.url))))

const template = readFileSync('scripts/templates/index.ts.template').toString()
const methodTemplate = readFileSync('scripts/templates/method.ts.template').toString()
const client = readFileSync('scripts/artifacts/GhostofavmClient.ts').toString()

const appSpec = JSON.parse(readFileSync('scripts/artifacts/Ghostofavm.arc56.json').toString())

const { name } = appSpec

let built = client
  .replace(`export class ${name}Client`, `class ${name}Client`)
  .replace(`export class ${name}Factory`, `class ${name}Factory`)

built += template.replace(/\{\{ARC56_NAME\}\}/g, name)

let methodStr: string[] = []

for (const method of appSpec.methods) {
  const supportsCreate = method.actions.create.includes('NoOp')
  if (!supportsCreate) {
    throw new Error(
      `Method ${method.name} does not support creation calls. Decorate it with \`@abimethod({ readonly: true, onCreate: 'require' })\``,
    )
  }
  if (!method.readonly) {
    throw new Error(
      `Method ${method.name} is not readonly. Decorate it with \`@abimethod({ readonly: true, onCreate: 'require' })\``,
    )
  }

  const methodName = method.name
  const abiMethod = new ABIMethod(method)
  const methodSignature = abiMethod.getSignature()

  console.log({ methodName, methodSignature })

  methodStr.push(
    methodTemplate.replace(/\{\{\METHOD_NAME}\}/g, methodName).replace(/\{\{\METHOD_SIGNATURE}\}/g, methodSignature),
  )
}

built = built.replace(/{{METHODS}}/, methodStr.join('\n'))

writeFileSync('src/index.ts', built)

console.log(`export class ${name}Client`)
