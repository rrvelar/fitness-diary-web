// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FitnessDiary {
    struct Entry {
        uint256 date;        // UNIX timestamp (чтобы проще было работать на фронте)
        uint256 weight;      // вес в кг * 100 (например, 7523 = 75.23 кг)
        uint256 caloriesIn;  // калории потреблено
        uint256 caloriesOut; // калории сожжено
        uint256 steps;       // шаги
    }

    mapping(address => Entry[]) private userEntries;

    event EntryAdded(address indexed user, uint256 indexed date, Entry entry);
    event EntryUpdated(address indexed user, uint256 indexed date, Entry entry);

    function addEntry(
        uint256 date,
        uint256 weight,
        uint256 caloriesIn,
        uint256 caloriesOut,
        uint256 steps
    ) external {
        Entry memory newEntry = Entry(date, weight, caloriesIn, caloriesOut, steps);
        userEntries[msg.sender].push(newEntry);
        emit EntryAdded(msg.sender, date, newEntry);
    }

    function updateEntry(
        uint256 index,
        uint256 date,
        uint256 weight,
        uint256 caloriesIn,
        uint256 caloriesOut,
        uint256 steps
    ) external {
        require(index < userEntries[msg.sender].length, "No entry");
        userEntries[msg.sender][index] = Entry(date, weight, caloriesIn, caloriesOut, steps);
        emit EntryUpdated(msg.sender, date, userEntries[msg.sender][index]);
    }

    function getEntries(address user) external view returns (Entry[] memory) {
        return userEntries[user];
    }

    function getEntry(address user, uint256 index) external view returns (Entry memory) {
        require(index < userEntries[user].length, "No entry");
        return userEntries[user][index];
    }

    function getEntriesCount(address user) external view returns (uint256) {
        return userEntries[user].length;
    }
}
