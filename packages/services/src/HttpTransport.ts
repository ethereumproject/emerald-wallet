import {JsonRpcRequest, Transport} from '@emeraldplatform/rpc';

/**
 * It should be used for request/response trace in dev version
 */
class HttpTransportAdapter implements Transport {
  transport: Transport;

  constructor(transport: Transport) {
    this.transport = transport;
  }
  request(req: Array<JsonRpcRequest>): Promise<Array<any>> {
    // We can log request here
    return this.transport.request(req)
      .then(result => {
        // And response here
        return result;
      });
  }
}

export default HttpTransportAdapter;
