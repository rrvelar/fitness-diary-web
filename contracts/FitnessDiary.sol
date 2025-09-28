// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FitnessDiary {
    struct Entry {
        uint32 date;          // YYYYMMDD
        int32 weightGrams;    // вес в граммах
        int32 caloriesIn;     // потреблено
        int32 caloriesOut;    // сожжено
        uint32 steps;         // шаги
        int32 netCalories;    // out - in
        bool exists;
    }

    mapping(address => mapping(uint32 => Entry)) private entries; // user → date → entry
    mapping(address => uint32[]) private userDates;               // user → list of dates

    event EntryLogged(address indexed user, uint32 indexed date, Entry entry);
    event EntryUpdated(address indexed user, uint32 indexed date, Entry entry);

    /// @notice Добавить новую запись
    function logEntry(
        uint32 date,
        int32 weightGrams,
        int32 caloriesIn,
        int32 caloriesOut,
        uint32 steps
    ) external {
        require(!entries[msg.sender][date].exists, "Entry already exists for this date");
        int32 netCalories = caloriesOut - caloriesIn;

        entries[msg.sender][date] = Entry(
            date,
            weightGrams,
            caloriesIn,
            caloriesOut,
            steps,
            netCalories,
            true
        );

        userDates[msg.sender].push(date);

        emit EntryLogged(msg.sender, date, entries[msg.sender][date]);
    }

    /// @notice Обновить запись за конкретную дату
    function updateEntry(
        uint32 date,
        int32 weightGrams,
        int32 caloriesIn,
        int32 caloriesOut,
        uint32 steps
    ) external {
        require(entries[msg.sender][date].exists, "No entry for this date");

        int32 netCalories = caloriesOut - caloriesIn;

        entries[msg.sender][date] = Entry(
            date,
            weightGrams,
            caloriesIn,
            caloriesOut,
            steps,
            netCalories,
            true
        );

        emit EntryUpdated(msg.sender, date, entries[msg.sender][date]);
    }

    /// @notice Получить запись по дате
    function getEntry(address user, uint32 date) external view returns (Entry memory) {
        return entries[user][date];
    }

    /// @notice Получить список всех дат для пользователя
    function getDates(address user) external view returns (uint32[] memory) {
        return userDates[user];
    }
}
