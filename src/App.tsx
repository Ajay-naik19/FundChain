import { useEffect, useState } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink
} from "react-router-dom"
import { BrowserProvider } from "ethers"

import Home from "./pages/Home"
import Explore from "./pages/Explore"
import CreateCampaign from "./pages/CreateCampaign"
import CampaignDetails from "./pages/CampaignDetails"
import Dashboard from "./pages/Dashboard"

function App() {
  const [walletAddress, setWalletAddress] = useState("")

  // Check if wallet is already connected
  async function checkWalletConnection() {
    if (!window.ethereum) {
      return
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts"
      })

      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
      }
    } catch (error) {
      console.error("Wallet check failed:", error)
    }
  }

  // Connect MetaMask wallet
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask")
      return
    }

    try {
      const provider = new BrowserProvider(window.ethereum)

      await provider.send(
        "eth_requestAccounts",
        []
      )

      // Switch to Sepolia Testnet
      await provider.send(
        "wallet_switchEthereumChain",
        [
          {
            chainId: "0xaa36a7"
          }
        ]
      )

      const signer = await provider.getSigner()

      const address = await signer.getAddress()

      setWalletAddress(address)

    } catch (error) {
      console.error("Wallet connection error:", error)

      alert(
        "Please connect MetaMask and switch to Sepolia testnet."
      )
    }
  }

  // Check wallet when application starts
  useEffect(() => {
    checkWalletConnection()

    if (!window.ethereum) {
      return
    }

    // Update wallet when account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
      } else {
        setWalletAddress("")
      }
    }

    window.ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    )

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      )
    }
  }, [])

  return (
    <BrowserRouter>

      {/* =========================================
          NAVBAR
      ========================================= */}

      <nav>

        {/* FundChain Logo / Home */}

        <NavLink
  to="/"
  end
  className="brand-logo"
>
  <span className="brand-symbol">⬡</span>
  <h2>FundChain</h2>
</NavLink>

        {/* Navigation Links */}

        <div>

          <NavLink
            to="/"
            end
          >
            Home
          </NavLink>

          <NavLink
            to="/explore"
          >
            Explore
          </NavLink>

          <NavLink
            to="/create"
          >
            Create Campaign
          </NavLink>

          <NavLink
            to="/dashboard"
          >
            Dashboard
          </NavLink>


          {/* Connect Wallet */}

          <button onClick={connectWallet}>
            {walletAddress
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : "Connect Wallet"}
          </button>

        </div>

      </nav>


      {/* =========================================
          ROUTES
      ========================================= */}

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/explore"
          element={<Explore />}
        />

        <Route
          path="/create"
          element={<CreateCampaign />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/campaign/:id"
          element={<CampaignDetails />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App