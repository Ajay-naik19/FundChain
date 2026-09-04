import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FundChainModule", (m) => {
  const fundChain = m.contract("FundChain");

  return { fundChain };
});