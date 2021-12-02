// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class AdminChanged extends ethereum.Event {
  get params(): AdminChanged__Params {
    return new AdminChanged__Params(this);
  }
}

export class AdminChanged__Params {
  _event: AdminChanged;

  constructor(event: AdminChanged) {
    this._event = event;
  }

  get previousAdmin(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newAdmin(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class BeaconUpgraded extends ethereum.Event {
  get params(): BeaconUpgraded__Params {
    return new BeaconUpgraded__Params(this);
  }
}

export class BeaconUpgraded__Params {
  _event: BeaconUpgraded;

  constructor(event: BeaconUpgraded) {
    this._event = event;
  }

  get beacon(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class NewRoleAdded extends ethereum.Event {
  get params(): NewRoleAdded__Params {
    return new NewRoleAdded__Params(this);
  }
}

export class NewRoleAdded__Params {
  _event: NewRoleAdded;

  constructor(event: NewRoleAdded) {
    this._event = event;
  }

  get role(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get permission(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }
}

export class Upgraded extends ethereum.Event {
  get params(): Upgraded__Params {
    return new Upgraded__Params(this);
  }
}

export class Upgraded__Params {
  _event: Upgraded;

  constructor(event: Upgraded) {
    this._event = event;
  }

  get implementation(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class Permissions extends ethereum.SmartContract {
  static bind(address: Address): Permissions {
    return new Permissions("Permissions", address);
  }

  PERMISSIONS_SET_ROLE(): Bytes {
    let result = super.call(
      "PERMISSIONS_SET_ROLE",
      "PERMISSIONS_SET_ROLE():(bytes32)",
      []
    );

    return result[0].toBytes();
  }

  try_PERMISSIONS_SET_ROLE(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "PERMISSIONS_SET_ROLE",
      "PERMISSIONS_SET_ROLE():(bytes32)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  UPGRADE_ROLE(): Bytes {
    let result = super.call("UPGRADE_ROLE", "UPGRADE_ROLE():(bytes32)", []);

    return result[0].toBytes();
  }

  try_UPGRADE_ROLE(): ethereum.CallResult<Bytes> {
    let result = super.tryCall("UPGRADE_ROLE", "UPGRADE_ROLE():(bytes32)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  checkPermission(role: string): boolean {
    let result = super.call(
      "checkPermission",
      "checkPermission(string):(bool)",
      [ethereum.Value.fromString(role)]
    );

    return result[0].toBoolean();
  }

  try_checkPermission(role: string): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "checkPermission",
      "checkPermission(string):(bool)",
      [ethereum.Value.fromString(role)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  permissions(param0: string): i32 {
    let result = super.call("permissions", "permissions(string):(uint8)", [
      ethereum.Value.fromString(param0)
    ]);

    return result[0].toI32();
  }

  try_permissions(param0: string): ethereum.CallResult<i32> {
    let result = super.tryCall("permissions", "permissions(string):(uint8)", [
      ethereum.Value.fromString(param0)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toI32());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class InitializeCall extends ethereum.Call {
  get inputs(): InitializeCall__Inputs {
    return new InitializeCall__Inputs(this);
  }

  get outputs(): InitializeCall__Outputs {
    return new InitializeCall__Outputs(this);
  }
}

export class InitializeCall__Inputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }

  get _dao(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class SetRoleCall extends ethereum.Call {
  get inputs(): SetRoleCall__Inputs {
    return new SetRoleCall__Inputs(this);
  }

  get outputs(): SetRoleCall__Outputs {
    return new SetRoleCall__Outputs(this);
  }
}

export class SetRoleCall__Inputs {
  _call: SetRoleCall;

  constructor(call: SetRoleCall) {
    this._call = call;
  }

  get role(): string {
    return this._call.inputValues[0].value.toString();
  }

  get permission(): SetRoleCallPermissionStruct {
    return changetype<SetRoleCallPermissionStruct>(
      this._call.inputValues[1].value.toTuple()
    );
  }
}

export class SetRoleCall__Outputs {
  _call: SetRoleCall;

  constructor(call: SetRoleCall) {
    this._call = call;
  }
}

export class SetRoleCallPermissionStruct extends ethereum.Tuple {
  get operator(): i32 {
    return this[0].toI32();
  }

  get validators(): Array<Address> {
    return this[1].toAddressArray();
  }

  get data(): Array<Bytes> {
    return this[2].toBytesArray();
  }
}

export class UpgradeToCall extends ethereum.Call {
  get inputs(): UpgradeToCall__Inputs {
    return new UpgradeToCall__Inputs(this);
  }

  get outputs(): UpgradeToCall__Outputs {
    return new UpgradeToCall__Outputs(this);
  }
}

export class UpgradeToCall__Inputs {
  _call: UpgradeToCall;

  constructor(call: UpgradeToCall) {
    this._call = call;
  }

  get newImplementation(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class UpgradeToCall__Outputs {
  _call: UpgradeToCall;

  constructor(call: UpgradeToCall) {
    this._call = call;
  }
}

export class UpgradeToAndCallCall extends ethereum.Call {
  get inputs(): UpgradeToAndCallCall__Inputs {
    return new UpgradeToAndCallCall__Inputs(this);
  }

  get outputs(): UpgradeToAndCallCall__Outputs {
    return new UpgradeToAndCallCall__Outputs(this);
  }
}

export class UpgradeToAndCallCall__Inputs {
  _call: UpgradeToAndCallCall;

  constructor(call: UpgradeToAndCallCall) {
    this._call = call;
  }

  get newImplementation(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get data(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class UpgradeToAndCallCall__Outputs {
  _call: UpgradeToAndCallCall;

  constructor(call: UpgradeToAndCallCall) {
    this._call = call;
  }
}
