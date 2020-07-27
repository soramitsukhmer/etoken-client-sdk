import { Bus } from "../src/core/Emittable";

type TokenResponseType = {
  certchain: string,
  signature: string,
  signeddata: string,
}

export class Emittable {
  /**
   * Set Listener
   * @param listener
   */
  setListener(listener: Bus): void;

  /**
   * @param topic
   * @param payload
   */
  emit(topic: string, payload: any): () => void;

  /**
   * @param topic
   * @param payload
   */
  publish(topic: string, payload: any): () => void;

  /**
   * @param topic
   * @param callback
   */
  on(topic: string, callback: () => {}): () => void;

  /**
   * @param topic
   * @param callback
   */
  subscribe(topic: string, callback: () => {}): () => void;
}

export class SafeNet extends Emittable {
  /**
   * Request eToken Prompt
   * @param scheme URL Scheme
   * @param target Open Target
   */
  request(scheme?: string, target?: string): void;

  /**
   * Sign data using eToken
   * @param data
   */
  sign(data: any): Promise<TokenResponseType>;

  /**
   * Terminate the connection
   * @param error
   */
  terminate(error: string): void;

  /**
   * Create a SHA256 Hash
   * @param data
   */
  static hash(data: any): string
}
