# eToken Client SDK

**Supported eToken**:
- SafeNet

## Usage

**Using SafeNet eToken**
```js
import { SafeNet } from 'etoken-client-sdk'

const eToken = new SafeNet()

const challenge = await eToken.sign('Data to be sign...')

console.log(JSON.parse(challenge))
```

**Result**:
```json
{
  "certchain": "<-- cert chain -->",
  "signature": "<-- signature -->",
  "signeddata": "<-- signed data -->"
}
```

## License
Licensed under [MIT](LICENSE)
