set(project "hello_world")
project(${project})

cmake_minimum_required(VERSION 3.10)

add_definitions(-std=c++11 -O3)
include_directories(include)

file(GLOB SOURCES src/*.cpp)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/docs")
add_executable(${project} ${SOURCES})

message(STATUS "Setting compilation target to WASM")
set(CMAKE_EXECUTABLE_SUFFIX ".wasm.js")
set_target_properties(${project} PROPERTIES LINK_FLAGS "-s WASM=1 -O3 -s EXTRA_EXPORTED_RUNTIME_METHODS='[cwrap]' -s FILESYSTEM=0 -s --llvm-lto 1 -flto")