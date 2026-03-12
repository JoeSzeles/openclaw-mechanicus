#!/bin/bash
TOKEN="7e3f7e32023e0220d91f15b4bb0d8469b34f3bda3b4b1b61242802ebb2264852"
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/ig/account" > account.json
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/ig/markets/CS.D.EURUSD.CFD.IP" > market.json
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/ig/pricehistory/CS.D.EURUSD.CFD.IP?resolution=MINUTE&max=1000" > prices.json