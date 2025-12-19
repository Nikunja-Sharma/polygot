cmake_minimum_required(VERSION 3.14)
project(chaos-engine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Fetch cpp-httplib
include(FetchContent)

FetchContent_Declare(
    httplib
    GIT_REPOSITORY https://github.com/yhirose/cpp-httplib.git
    GIT_TAG v0.14.3
)

FetchContent_Declare(
    json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.11.3
)

FetchContent_MakeAvailable(httplib json)

# Create executable
add_executable(chaos-engine main.cpp)

# Link libraries
target_link_libraries(chaos-engine PRIVATE httplib::httplib nlohmann_json::nlohmann_json)

# Find and link pthread
find_package(Threads REQUIRED)
target_link_libraries(chaos-engine PRIVATE Threads::Threads)

# Install target
install(TARGETS chaos-engine DESTINATION bin)
