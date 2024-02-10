to compile some C++ program do in terminal after installation of emsdk(if windows):
1. cd .\emsdk\                                                                   <-- change directory from root
2. Set-ExecutionPolicy RemoteSigned -Scope Process                               <-- give permission to run scripts for this terminal window
3. ./emsdk activate latest --permanent                                           <-- add some commands to work in terminal (in my IDE they all die with reload of IDE)
4. emcc -o a.out.js ./../src/core.cpp -O3 -s WASM=1 -s NO_EXIT_RUNTIME=1  -sEXPORTED_RUNTIME_METHODS=cwrap        <-- compile core.cpp to a pair a.out.js and a.out.wasm

after that cut and paste a.out.js and a.out.wasm to docs/ directory to use them with javascript
