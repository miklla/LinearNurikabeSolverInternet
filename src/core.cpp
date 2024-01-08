#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#endif
#include <iostream>

extern "C"
{
    EMSCRIPTEN_KEEPALIVE
    const char *getHelloMessage(char* strrr)
    {
        std::cout << "?!!!!\n";
        int nsymb = 0;
        char* ptr = strrr;
        while(*ptr != 0) {
            ++nsymb;
            ++ptr;
        }

        char* str2 = new char[nsymb];
        for(int i = 0; i < nsymb; ++i)
            str2[i] = strrr[nsymb - 1 - i];
        return str2;

        //const char *str = "Hello, world! 3\n";
        //return str;
    }
}

/*#include <ctime>
#include <chrono>
#include <iostream>

using namespace std;
using namespace std::chrono;

int main()
{
    high_resolution_clock::time_point start_time = high_resolution_clock::now();

    long r = time(NULL);
    for (long i = 0; i < 2000000000; ++i)
        r += i;
	cout << "Hello CMake. v2 " << r << endl;
    
    auto int_ms = duration_cast<milliseconds>(high_resolution_clock::now() - start_time);

    cout << ' ' << int_ms.count() << " ms\n";

	return 0;
}*/