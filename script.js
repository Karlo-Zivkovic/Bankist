'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-07-22T17:01:17.194Z',
    '2023-07-23T23:36:17.929Z',
    '2023-07-28T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

const movContainer = document.querySelector('.movements-container');
const curBalance = document.querySelector('.current-balance');
const inMovements = document.querySelector('.in');
const outMovements = document.querySelector('.out');
const interestEl = document.querySelector('.interest');
const btnLogIn = document.querySelector('.btn-log-in');
const logInUser = document.getElementById('username');
const logInPass = document.getElementById('password');
const greeting = document.querySelector('.greeting');
const main = document.querySelector('.hidden');
const transferMoneyTo = document.getElementById('transfer-to');
const amount = document.getElementById('amount');
const btnTransfer = document.querySelector('.btn-arrow');
const btnRequestLoan = document.querySelector('.btn-arrow-mid');
const confirmUser = document.getElementById('close-account');
const confirmPin = document.getElementById('pin');
const btnCloseAcc = document.querySelector('.btn-close-account');
const requestLoan = document.getElementById('request-loan');
const btnSort = document.querySelector('.btn-sort');
const date = document.querySelector('.date');
const timer = document.querySelector('.timer');

const startLogOutTimer = function () {
  const tick = function () {
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);
    timer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(intervalTimer);
      greeting.textContent = `Login to get started`;
      main.classList.add('hidden');
    }
    time--;
  };

  let time = 600;
  tick();
  const intervalTimer = setInterval(tick, 1000);
  return intervalTimer;
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};
const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsername(accounts);

const displayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  curBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const displaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  inMovements.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = Math.abs(
    acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  );
  outMovements.textContent = formatCur(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * currentAccount.interestRate) / 100)
    .reduce((acc, mov) => acc + mov, 0);
  interestEl.textContent = formatCur(interest, acc.locale, acc.currency);
};
const addMovements = function (acc, sort = false) {
  movContainer.innerHTML = '';
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (mov, i, arr) {
    const date = new Date(currentAccount.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.loacle);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const type = mov > 0 ? `deposit` : `withdrawal`;
    const html = `<div class="movement">
  <p class="mov-${type}">${i + 1} ${type}</p>
  <p class="mov-date">${displayDate}</p>
  <p class="mov-value">${formattedMov}</p>
  </div>`;
    movContainer.insertAdjacentHTML('afterbegin', html);
  });
};

const updateUi = function (acc) {
  displayBalance(acc);
  displaySummary(acc);
  addMovements(acc);
};
let currentAccount, intervalTimer;

btnLogIn.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(acc => acc.username === logInUser.value);
  if (currentAccount?.pin === +logInPass.value) {
    greeting.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    updateUi(currentAccount);
    main.classList.remove('hidden');

    logInUser.value = logInPass.value = '';
    logInPass.blur();

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    date.textContent = `As of ${new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now)}`;
    if (intervalTimer) clearInterval(intervalTimer);
    intervalTimer = startLogOutTimer();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const recieverAcc = accounts.find(
    acc => acc.username === transferMoneyTo.value
  );

  if (
    +amount.value > 0 &&
    recieverAcc &&
    currentAccount.balance >= +amount.value &&
    transferMoneyTo.value !== currentAccount.username
  ) {
    recieverAcc.movements.push(+amount.value);
    currentAccount.movements.push(amount.value * -1);
    recieverAcc.movementsDates.push(new Date().toISOString());
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUi(currentAccount);
  }
  transferMoneyTo.value = amount.value = '';
  clearInterval(intervalTimer);
  intervalTimer = startLogOutTimer();
});

btnRequestLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(requestLoan.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUi(currentAccount);
      requestLoan.value = '';
    }, 2500);
  }
});

btnCloseAcc.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentAccount.pin === +confirmPin.value &&
    currentAccount.username === confirmUser.value
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    main.classList.add('hidden');
    logInPass.blur();
    greeting.textContent = `Log in to get started`;
  }
  confirmUser.value = confirmPin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  addMovements(currentAccount, !sorted);
  sorted = !sorted;
});
