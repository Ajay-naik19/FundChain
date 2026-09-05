import { useState } from "react"
import { BrowserProvider, Contract, parseEther } from "ethers"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../contract"

function CreateCampaign() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [target, setTarget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [image, setImage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSelectedFile(file)

    const reader = new FileReader()

    reader.onloadend = () => {
      setImage(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  async function uploadImageToPinata(file: File) {
    const formData = new FormData()

    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || "Image upload failed"
      )
    }

    if (!data?.data?.cid) {
      throw new Error(
        "Pinata did not return an image CID"
      )
    }

    return data.data.cid as string
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (!window.ethereum) {
      alert("Please install MetaMask")
      return
    }

    if (!selectedFile) {
      alert("Please select a campaign image")
      return
    }

    try {
      setLoading(true)

      /*
       * STEP 1
       * Upload image to Pinata/IPFS
       */
      alert("Uploading campaign image to IPFS...")

      const imageCid =
        await uploadImageToPinata(selectedFile)

      console.log("IPFS CID:", imageCid)

      /*
       * STEP 2
       * Connect MetaMask
       */
      await window.ethereum.request({
        method: "eth_requestAccounts"
      })

      /*
       * STEP 3
       * Create provider and check network
       */
      let provider =
        new BrowserProvider(window.ethereum)

      let network =
        await provider.getNetwork()

      /*
       * Sepolia Chain ID = 11155111
       */
      if (network.chainId !== 11155111n) {
        /*
         * Switch MetaMask to Sepolia
         */
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: "0xaa36a7"
            }
          ]
        })

        /*
         * IMPORTANT:
         * MetaMask changed networks.
         * Create a NEW provider after the switch.
         */
        provider =
          new BrowserProvider(window.ethereum)

        network =
          await provider.getNetwork()
      }

      /*
       * Verify that we are now on Sepolia
       */
      if (network.chainId !== 11155111n) {
        throw new Error(
          "Please switch MetaMask to Sepolia network."
        )
      }

      /*
       * STEP 4
       * Get signer after network switch
       */
      const signer =
        await provider.getSigner()

      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      )

      /*
       * STEP 5
       * Convert target ETH to Wei
       */
      const targetInWei =
        parseEther(target)

      /*
       * Convert deadline to Unix timestamp
       */
      const deadlineTimestamp =
        Math.floor(
          new Date(deadline).getTime() / 1000
        )

      /*
       * STEP 6
       * Create campaign on blockchain
       */
      const transaction =
        await contract.createCampaign(
          title,
          description,
          targetInWei,
          deadlineTimestamp
        )

      alert(
        "Please confirm the transaction in MetaMask and wait..."
      )

      /*
       * Wait for blockchain confirmation
       */
      await transaction.wait()

      /*
       * STEP 7
       * Get latest campaign index
       */
      const existingCampaigns =
        await contract.getCampaigns()

      const campaignIndex =
        Number(existingCampaigns.length) - 1

      /*
       * Save IPFS CID locally temporarily.
       *
       * We will replace this with permanent
       * blockchain image storage later.
       */
      localStorage.setItem(
        `fundchain-ipfs-${campaignIndex}`,
        imageCid
      )

      /*
       * SUCCESS
       */
      alert(
        "Campaign created successfully! 🎉"
      )

      /*
       * Clear form
       */
      setTitle("")
      setDescription("")
      setTarget("")
      setDeadline("")
      setImage("")
      setSelectedFile(null)

    } catch (error) {
      console.error(
        "Campaign creation failed:",
        error
      )

      alert(
        "Campaign creation failed. Please check the console and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="create-container">

        <h1>Create a Campaign</h1>

        <p className="create-subtitle">
          Start your campaign and raise funds from the community.
        </p>

        <form onSubmit={handleSubmit}>

          <label>
            Campaign Title
          </label>

          <input
            type="text"
            placeholder="Enter campaign title"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            required
          />

          <label>
            Description
          </label>

          <textarea
            placeholder="Describe your campaign"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            required
          />

          <label>
            Target Amount (ETH)
          </label>

          <input
            type="number"
            placeholder="Example: 2"
            value={target}
            onChange={(event) =>
              setTarget(
                event.target.value
              )
            }
            min="0"
            step="0.01"
            required
          />

          <label>
            Deadline
          </label>

          <input
            type="date"
            value={deadline}
            onChange={(event) =>
              setDeadline(
                event.target.value
              )
            }
            required
          />

          <label>
            Campaign Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={
              handleImageChange
            }
            required
          />

          {image && (
           <img
  src={image}
  alt="Campaign preview"
  style={{
    width: "100%",
    height: "300px",
    objectFit: "contain",
    display: "block",
    marginTop: "15px",
    borderRadius: "12px",
    backgroundColor: "#f8fafc"
  }}
/>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Uploading & Creating..."
              : "Create Campaign"}
          </button>

        </form>

      </div>
    </div>
  )
}

export default CreateCampaign