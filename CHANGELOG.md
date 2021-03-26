# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.1.0-alpha.4 (2021-03-26)

**Note:** Version bump only for package villekulla-reservations





# 0.1.0-alpha.3 (2021-03-26)

**Note:** Version bump only for package villekulla-reservations





# [0.1.0-alpha.1](https://github.com/herschel666/villekulla-reservations/compare/05f62be135c95d0376477ae2169db5a64080e387...v0.1.0-alpha.1) (2021-03-25)


### Bug Fixes

* check user state before doing API calls ([59644c1](https://github.com/herschel666/villekulla-reservations/commit/59644c1e7ec074a1aea97e0f896954d87cdbd647))
* delete invalid login cookie ([a201724](https://github.com/herschel666/villekulla-reservations/commit/a2017246f783e71b86f53f45a3e3107734a402db))
* provide explicit invalid result from user verification ([9e91014](https://github.com/herschel666/villekulla-reservations/commit/9e91014e125951ac9c5fc75330684cf256f6f3c8))
* remove mailing feature ([3391bf3](https://github.com/herschel666/villekulla-reservations/commit/3391bf3f3cfbc0f06b49c9219d9091f484204521))
* remove timezone issues ([288ab09](https://github.com/herschel666/villekulla-reservations/commit/288ab09986fa1b7c3d8d453eb98e10c22483b612))
* remove user ID from event creation payload ([c3c24ea](https://github.com/herschel666/villekulla-reservations/commit/c3c24eaa9c35fd287dbbcc3bc1ad92230e3a1df8))
* set correct button type ([1cd9da6](https://github.com/herschel666/villekulla-reservations/commit/1cd9da6ce19c9325985ac033681f5d3a3a218e37))
* skip hitting DB for user after reading JWT payload ([d8769a2](https://github.com/herschel666/villekulla-reservations/commit/d8769a260770df170bc50ba8c46f099678e64761))
* use more appropriate status code ([fb8c034](https://github.com/herschel666/villekulla-reservations/commit/fb8c0346e7fb969b58f21623727d392c8ddd856b))


### Features

* add calendar events to server ([3e5ea4e](https://github.com/herschel666/villekulla-reservations/commit/3e5ea4eb3c6ae23c0246a08ffa128c46056cdf86))
* add distinction between public & private routes ([10b467b](https://github.com/herschel666/villekulla-reservations/commit/10b467b4ae00301ebb73644a4727a65fbfeb0170))
* add event detail page ([b450244](https://github.com/herschel666/villekulla-reservations/commit/b45024440a4cbc0e8822d545bbcec4c7df3c92db))
* add generic form component ([3b4fd16](https://github.com/herschel666/villekulla-reservations/commit/3b4fd16acf29aadb0b8459b82b8fef2dad65b22c))
* add helper for env variables ([3093993](https://github.com/herschel666/villekulla-reservations/commit/30939933886ee969f0ac1dc0697bfdd24fdf2270))
* add in-memory SQLite DB & respective API endpoints ([b70c318](https://github.com/herschel666/villekulla-reservations/commit/b70c31873098cd440d6ca7bfc1a2239af80bd5c3))
* add link to start page ([8060c72](https://github.com/herschel666/villekulla-reservations/commit/8060c7277841842ef2fc05684326c90b8006ce62))
* add Node server ([6551d4c](https://github.com/herschel666/villekulla-reservations/commit/6551d4cc30e5c90ddfdb69645b33c5a0ae981fec))
* add preliminary date selection ([286544d](https://github.com/herschel666/villekulla-reservations/commit/286544db476c3ab07cbc5875848f5ed709c21c81))
* add preliminary event creation & fetching ([3896b56](https://github.com/herschel666/villekulla-reservations/commit/3896b56c86f2a23972631d6bd82a2913b0b76873))
* add preliminary password reset endpoint ([35313cc](https://github.com/herschel666/villekulla-reservations/commit/35313cc94dcba9fa395181a197313edbf24c516d))
* add role to users ([0585344](https://github.com/herschel666/villekulla-reservations/commit/05853441b6364faaa91653d98458cfbc7b1dc196))
* add routing ([05f62be](https://github.com/herschel666/villekulla-reservations/commit/05f62be135c95d0376477ae2169db5a64080e387))
* add user interface ([1f8cf70](https://github.com/herschel666/villekulla-reservations/commit/1f8cf7095b75d622d17688d3fc8ec9ec69bc2bc0))
* auto-focus textarea on event creation ([0a45e3f](https://github.com/herschel666/villekulla-reservations/commit/0a45e3f15bee256094bfdba153efbed23c002a7d))
* completely reflect calendar state in the URL ([9b7285e](https://github.com/herschel666/villekulla-reservations/commit/9b7285e3e87b797f329688644f07681591f2b97d))
* configure DB location via env var ([62d8716](https://github.com/herschel666/villekulla-reservations/commit/62d871653c85cf8631cf6a6af95e82779ab17fef))
* configure location of scaffolding data via env var ([bcff3cf](https://github.com/herschel666/villekulla-reservations/commit/bcff3cf0dd0b8a7ded1f72ee1167746be8891629))
* display resource list on start page ([503e4c7](https://github.com/herschel666/villekulla-reservations/commit/503e4c77321be785256f4ecbfcd7e4ceeda2458f))
* do session verification in pre-route handler ([353ed49](https://github.com/herschel666/villekulla-reservations/commit/353ed4901a11357d00efd9da6bbb61ef13efa02e))
* enable deleting events ([a641916](https://github.com/herschel666/villekulla-reservations/commit/a641916e68b710d7a59cabbb4d6ccdeed8599e44))
* enable password-reset form ([f41a7ae](https://github.com/herschel666/villekulla-reservations/commit/f41a7aef804f59922abf9a998fd585e592c6f5f7))
* enable updating passwords ([cf9c8e6](https://github.com/herschel666/villekulla-reservations/commit/cf9c8e643c22ff493787cae9b0e527f1877cfca8))
* improve state representation in URL ([d5a2dc6](https://github.com/herschel666/villekulla-reservations/commit/d5a2dc62b8d07917d057b80d2179ba58d517474e))
* increase main content width ([78cd6b7](https://github.com/herschel666/villekulla-reservations/commit/78cd6b72e32f0f9b1277573db45282e2118fd226))
* introduce Fluent UI ([d919f41](https://github.com/herschel666/villekulla-reservations/commit/d919f41ed2d433097fc8ca10de843da597025d21))
* list three next events of user on start page ([6720414](https://github.com/herschel666/villekulla-reservations/commit/6720414cffbf7203a4144ba12f4cd01c718177ae))
* optionally populate DB with all given scaffolding data ([5a1687e](https://github.com/herschel666/villekulla-reservations/commit/5a1687e4855be20c755387f9c257ca938b171e03))
* prevent creation of overlapping events ([ebfda8b](https://github.com/herschel666/villekulla-reservations/commit/ebfda8b8d342df2c46c58f82628b3acb8de62b36))
* provide data of logged-in user to app ([9e9b953](https://github.com/herschel666/villekulla-reservations/commit/9e9b953c6a0d95abc923503db488a297329ab188))
* put reservation form on separate page ([c395061](https://github.com/herschel666/villekulla-reservations/commit/c39506146e450e250a845bbfb5085281b974f931))
* require password reset token to be unique ([f06625c](https://github.com/herschel666/villekulla-reservations/commit/f06625cfee77fe396be59baf02b9d7327283e7ee))
* return user object from verify-session endpoint ([16546a8](https://github.com/herschel666/villekulla-reservations/commit/16546a8c735613b66d935601002ad31c7a350413))
* spike basic user authentication ([d4a93a8](https://github.com/herschel666/villekulla-reservations/commit/d4a93a8b8ea1b03f59cf90e6e2e99af1247113fc))
* style event creation page ([ea32839](https://github.com/herschel666/villekulla-reservations/commit/ea328391a9e4d3223838041c6875402a2b3e991c))
* style event detail page ([3792e14](https://github.com/herschel666/villekulla-reservations/commit/3792e1454b81347d6cdaba6bb0fcfcffcbd881d6))
* style login page ([790d816](https://github.com/herschel666/villekulla-reservations/commit/790d81662327833178abdc49202e9f6aaad480e2))
* style main header ([7dbb05f](https://github.com/herschel666/villekulla-reservations/commit/7dbb05f28dbe3d4792555afddab0e1b20ffa3850))
* style password reset page ([a5f4705](https://github.com/herschel666/villekulla-reservations/commit/a5f470505aac53726087dbce29f3f2bef1314891))
* style the start page ([d03a176](https://github.com/herschel666/villekulla-reservations/commit/d03a176021244ed0b56229e432b302e2ae514932))


# [0.1.0-alpha.0](https://github.com/herschel666/villekulla-reservations/compare/v0.1.0-alpha.1...v0.1.0-alpha.0) (2021-03-24)
