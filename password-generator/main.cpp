#include <iostream>
#include <cstdlib>
#include <ctime>
#include <windows.h>
using namespace std;

int main(int argc, char* argv[]) {
    string characters = "abcdefghijklmnopqrstuwxyz1234567890!@#$%^&*()-=_+;:,.<>/?[]{}";

    int password_length = 12; // default length

    if (argc > 1) {
        password_length = stoi(argv[1]);
    }

    srand(static_cast<unsigned int>(time(nullptr)));

    string password = "";
    for (int i = 0; i < password_length; i++)
        password += characters[rand() % characters.size()];

    const char* output = password.c_str();
    HGLOBAL hMem = GlobalAlloc(GMEM_MOVEABLE, strlen(output) + 1);
    memcpy(GlobalLock(hMem), output, strlen(output) + 1);
    GlobalUnlock(hMem);
    OpenClipboard(0);
    EmptyClipboard();
    SetClipboardData(CF_TEXT, hMem);
    CloseClipboard();

    cout << "Generated password (" << password_length << "): " << password << endl;
    cout << "Copied to clipboard" << endl;
}
