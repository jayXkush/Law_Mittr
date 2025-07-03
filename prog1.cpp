#include <bits/stdc++.h>
using namespace std;

int main() {
    string data, stuffed = "";
    cin >> data;
    int count = 0;
    for (char bit : data) {
        if (bit == '1') {
            count++;
            stuffed += bit;
            if (count == 5) {
                stuffed += '0';
                count = 0;
            }
        } else {
            stuffed += bit;
            count = 0;
        }
    }
    cout << stuffed << endl;
    return 0;
}