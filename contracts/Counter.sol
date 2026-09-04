// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract FundChain {

    struct Campaign {
        address payable owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
    }

    Campaign[] public campaigns;

    mapping(uint256 => address[]) public donors;

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline
    ) public {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_target > 0, "Target must be greater than zero");

        campaigns.push(
            Campaign(
                payable(msg.sender),
                _title,
                _description,
                _target,
                _deadline,
                0
            )
        );
    }

    function donateToCampaign(uint256 _campaignId) public payable {
        Campaign storage campaign = campaigns[_campaignId];

        require(block.timestamp < campaign.deadline, "Campaign ended");
        require(msg.value > 0, "Donation must be greater than zero");

        campaign.amountCollected += msg.value;
        donors[_campaignId].push(msg.sender);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }

    function withdraw(uint256 _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];

        require(msg.sender == campaign.owner, "Only owner can withdraw");
        require(
            block.timestamp >= campaign.deadline,
            "Campaign is still active"
        );

        uint256 amount = campaign.amountCollected;
        require(amount > 0, "No funds to withdraw");

        campaign.amountCollected = 0;

        campaign.owner.transfer(amount);
    }
    function getDonors(uint256 _campaignId)
    public
    view
    returns (address[] memory)
{
    return donors[_campaignId];
}
}