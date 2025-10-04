import { ABIMethod } from 'algosdk'
import { sign } from 'crypto'
import { readFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

// Change to the parent directory of where the script is located
process.chdir(dirname(dirname(fileURLToPath(import.meta.url))))

const template = readFileSync('scripts/index.ts.template').toString()
const methodTemplate = readFileSync('scripts/method.ts.template').toString()
const appSpec = JSON.parse(readFileSync('src/generated/Ghostofavm.arc56.json').toString())

const { name } = appSpec

let built = template.replace(/\{\{ARC56_NAME\}\}/g, name)

console.log(built)

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

  methodStr.push(methodTemplate.replace(/\{\{\METHOD_NAME}\}/g, methodName).replace(/\{\{\METHOD_SIGNATURE}\}/g, methodSignature))
}

built = built.replace(/{{METHODS}}/, methodStr.join('\n\n'))

console.log(built)
