// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FitnessDiary {
    struct Entry {
        uint32 date;          // YYYYMMDD
        int32 weightGrams;    // вес в граммах
        int32 caloriesIn;     // потреблено
        int32 caloriesOut;    // сожжено
        uint32 steps;         // шаги
        bool exists;
    }

    mapping(address => mapping(uint32 => Entry)) private entries; // user → date → entry
    mapping(address => uint32[]) private userDates;               // user → list of dates

    event EntryAction(address indexed user, uint32 indexed date, string action);

    /// @notice Добавить новую запись
    function logEntry(
        uint32 date,
        int32 weightGrams,
        int32 caloriesIn,
        int32 caloriesOut,
        uint32 steps
    ) external {
        require(!entries[msg.sender][date].exists, "Entry exists");
        entries[msg.sender][date] = Entry(date, weightGrams, caloriesIn, caloriesOut, steps, true);
        userDates[msg.sender].push(date);

        emit EntryAction(msg.sender, date, "created");
    }

    /// @notice Обновить запись за конкретную дату
    function updateEntry(
        uint32 date,
        int32 weightGrams,
        int32 caloriesIn,
        int32 caloriesOut,
        uint32 steps
    ) external {
        require(entries[msg.sender][date].exists, "No entry");
        entries[msg.sender][date] = Entry(date, weightGrams, caloriesIn, caloriesOut, steps, true);

        emit EntryAction(msg.sender, date, "updated");
    }

    /// @notice "Удалить" запись (exists=false)
    function deleteEntry(uint32 date) external {
        require(entries[msg.sender][date].exists, "No entry");
        entries[msg.sender][date].exists = false;

        emit EntryAction(msg.sender, date, "deleted");
    }

    /// @notice Получить запись по дате
    function getEntry(address user, uint32 date) external view returns (Entry memory) {
        return entries[user][date];
    }

    /// @notice Получить даты с пагинацией
    function getDates(address user, uint256 startIndex, uint256 count) external view returns (uint32[] memory) {
        uint32[] memory allDates = userDates[user];
        require(startIndex + count <= allDates.length, "Out of bounds");

        uint32[] memory result = new uint32[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = allDates[startIndex + i];
        }
        return result;
    }

    /// @notice Посчитать netCalories на лету
    function getNetCalories(address user, uint32 date) external view returns (int32) {
        Entry memory e = entries[user][date];
        require(e.exists, "No entry");
        return e.caloriesOut - e.caloriesIn;
    }

    /// @notice Сколько всего дат у пользователя (для фронта, чтобы делать пагинацию)
    function getDatesCount(address user) external view returns (uint256) {
        return userDates[user].length;
    }
}
