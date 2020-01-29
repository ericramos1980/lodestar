import {List} from "../../interface";
import {BasicListType, CompositeListType} from "../../types";
import {mixInLength} from "../../util/compat";
import {BasicArrayStructuralHandler, CompositeArrayStructuralHandler} from "./array";

export class BasicListStructuralHandler<T extends List<any>> extends BasicArrayStructuralHandler<T> {
  _type: BasicListType<T>;
  constructor(type: BasicListType<T>) {
    super();
    this._type = type;
  }
  defaultValue(): T {
    return [] as unknown as T;
  }
  getLength(value: T): number {
    return value.length;
  }
  fromBytes(data: Uint8Array, start: number, end: number): T {
    if ((end - start) / this._type.elementType.size() > this._type.limit) {
      throw new Error("Deserialized list length greater than limit");
    }
    return super.fromBytes(data, start, end);
  }
  nonzeroChunkCount(value: T): number {
    return Math.ceil(value.length * this._type.elementType.size() / 32);
  }
  hashTreeRoot(value: T): Uint8Array {
    return mixInLength(super.hashTreeRoot(value), value.length); 
  }
}

export class CompositeListStructuralHandler<T extends List<any>> extends CompositeArrayStructuralHandler<T> {
  _type: CompositeListType<T>;
  constructor(type: CompositeListType<T>) {
    super();
    this._type = type;
  }
  defaultValue(): T {
    return [] as unknown as T;
  }
  getLength(value: T): number {
    return value.length;
  }
  fromBytes(data: Uint8Array, start: number, end: number): T {
    const value = super.fromBytes(data, start, end);
    if (value.length > this._type.limit) {
      throw new Error("Deserialized list length greater than limit");
    }
    return value;
  }
  nonzeroChunkCount(value: T): number {
    return value.length;
  }
  hashTreeRoot(value: T): Uint8Array {
    return mixInLength(super.hashTreeRoot(value), value.length); 
  }
}