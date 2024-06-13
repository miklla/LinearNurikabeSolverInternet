to compile some C++ program do in terminal after installation of emsdk(if windows):
0. paste C++ code in src/solver.cpp (absent in git)
1. cd .\emsdk\                                                                   <-- change directory from root
2. Set-ExecutionPolicy RemoteSigned -Scope Process                               <-- give permission to run scripts for this terminal window
3. ./emsdk activate latest --permanent                                           <-- add some commands to work in terminal (in my IDE they all die with reload of IDE)
4. emcc -o ./../docs/solver_web.js ./../src/solver.cpp -O3 -sWASM=1 -sNO_EXIT_RUNTIME=1 -sEXPORTED_RUNTIME_METHODS=cwrap        <-- compile solver.cpp to a pair solver_web.js and solver_web.wasm
