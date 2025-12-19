#include "httplib.h"
#include <nlohmann/json.hpp>
#include <thread>
#include <atomic>
#include <chrono>
#include <vector>
#include <cmath>
#include <mutex>

using json = nlohmann::json;

// Safety limits
constexpr int MAX_CPU_BURN_SECONDS = 30;
constexpr size_t MAX_MEMORY_MB = 256;

// Global state for tracking active chaos operations
std::atomic<bool> cpu_burn_active{false};
std::atomic<bool> memory_alloc_active{false};
std::mutex memory_mutex;
std::vector<char*> allocated_blocks;

// CPU burn function - performs intensive calculations
void burn_cpu(int duration_seconds) {
    auto start = std::chrono::steady_clock::now();
    auto end = start + std::chrono::seconds(duration_seconds);
    
    while (std::chrono::steady_clock::now() < end && cpu_burn_active.load()) {
        // Intensive floating point operations
        volatile double result = 0;
        for (int i = 0; i < 100000; ++i) {
            result += std::sin(i) * std::cos(i) * std::tan(i);
        }
    }
    cpu_burn_active.store(false);
}

// Memory allocation function
bool allocate_memory(size_t mb) {
    std::lock_guard<std::mutex> lock(memory_mutex);
    
    // Release any previously allocated memory first
    for (auto* block : allocated_blocks) {
        delete[] block;
    }
    allocated_blocks.clear();
    
    try {
        // Allocate in 1MB chunks
        for (size_t i = 0; i < mb; ++i) {
            char* block = new char[1024 * 1024]; // 1MB
            // Touch the memory to ensure it's actually allocated
            std::memset(block, 'X', 1024 * 1024);
            allocated_blocks.push_back(block);
        }
        return true;
    } catch (const std::bad_alloc&) {
        // Clean up on failure
        for (auto* block : allocated_blocks) {
            delete[] block;
        }
        allocated_blocks.clear();
        return false;
    }
}

// Release allocated memory
void release_memory() {
    std::lock_guard<std::mutex> lock(memory_mutex);
    for (auto* block : allocated_blocks) {
        delete[] block;
    }
    allocated_blocks.clear();
    memory_alloc_active.store(false);
}

int main() {
    httplib::Server svr;
    
    // Health endpoint
    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        json response = {
            {"status", "healthy"},
            {"service", "chaos-cpp"}
        };
        res.set_content(response.dump(), "application/json");
    });

    // CPU burn endpoint
    svr.Post("/chaos/cpu", [](const httplib::Request& req, httplib::Response& res) {
        json response;
        
        try {
            json body = json::parse(req.body);
            int duration = body.value("duration_seconds", 10);
            
            // Apply safety limit
            if (duration > MAX_CPU_BURN_SECONDS) {
                duration = MAX_CPU_BURN_SECONDS;
            }
            if (duration < 1) {
                duration = 1;
            }
            
            // Check if already burning
            if (cpu_burn_active.load()) {
                response = {
                    {"type", "cpu_burn"},
                    {"error", "CPU burn already in progress"},
                    {"completed", false}
                };
                res.status = 409;
                res.set_content(response.dump(), "application/json");
                return;
            }
            
            cpu_burn_active.store(true);
            
            // Run CPU burn in a separate thread
            std::thread burn_thread([duration]() {
                burn_cpu(duration);
            });
            burn_thread.detach();
            
            response = {
                {"type", "cpu_burn"},
                {"duration_seconds", duration},
                {"max_duration", MAX_CPU_BURN_SECONDS},
                {"started", true},
                {"completed", false}
            };
            res.set_content(response.dump(), "application/json");
            
        } catch (const json::exception& e) {
            response = {
                {"type", "cpu_burn"},
                {"error", "Invalid JSON body"},
                {"completed", false}
            };
            res.status = 400;
            res.set_content(response.dump(), "application/json");
        }
    });
    
    // Memory allocation endpoint
    svr.Post("/chaos/memory", [](const httplib::Request& req, httplib::Response& res) {
        json response;
        
        try {
            json body = json::parse(req.body);
            size_t mb = body.value("megabytes", 64);
            int hold_seconds = body.value("hold_seconds", 10);
            
            // Apply safety limits
            if (mb > MAX_MEMORY_MB) {
                mb = MAX_MEMORY_MB;
            }
            if (mb < 1) {
                mb = 1;
            }
            if (hold_seconds > 60) {
                hold_seconds = 60;
            }
            if (hold_seconds < 1) {
                hold_seconds = 1;
            }
            
            // Check if already allocating
            if (memory_alloc_active.load()) {
                response = {
                    {"type", "memory_allocation"},
                    {"error", "Memory allocation already in progress"},
                    {"completed", false}
                };
                res.status = 409;
                res.set_content(response.dump(), "application/json");
                return;
            }
            
            memory_alloc_active.store(true);
            
            // Allocate memory
            if (!allocate_memory(mb)) {
                memory_alloc_active.store(false);
                response = {
                    {"type", "memory_allocation"},
                    {"error", "Failed to allocate memory"},
                    {"completed", false}
                };
                res.status = 500;
                res.set_content(response.dump(), "application/json");
                return;
            }
            
            // Schedule auto-release
            std::thread release_thread([hold_seconds]() {
                std::this_thread::sleep_for(std::chrono::seconds(hold_seconds));
                release_memory();
            });
            release_thread.detach();
            
            response = {
                {"type", "memory_allocation"},
                {"megabytes", mb},
                {"max_megabytes", MAX_MEMORY_MB},
                {"hold_seconds", hold_seconds},
                {"started", true},
                {"completed", false}
            };
            res.set_content(response.dump(), "application/json");
            
        } catch (const json::exception& e) {
            response = {
                {"type", "memory_allocation"},
                {"error", "Invalid JSON body"},
                {"completed", false}
            };
            res.status = 400;
            res.set_content(response.dump(), "application/json");
        }
    });
    
    // Status endpoint to check current chaos state
    svr.Get("/chaos/status", [](const httplib::Request&, httplib::Response& res) {
        size_t allocated_mb = 0;
        {
            std::lock_guard<std::mutex> lock(memory_mutex);
            allocated_mb = allocated_blocks.size();
        }
        
        json response = {
            {"cpu_burn_active", cpu_burn_active.load()},
            {"memory_alloc_active", memory_alloc_active.load()},
            {"allocated_mb", allocated_mb}
        };
        res.set_content(response.dump(), "application/json");
    });
    
    // Stop all chaos operations
    svr.Post("/chaos/stop", [](const httplib::Request&, httplib::Response& res) {
        cpu_burn_active.store(false);
        release_memory();
        
        json response = {
            {"message", "All chaos operations stopped"},
            {"completed", true}
        };
        res.set_content(response.dump(), "application/json");
    });
    
    std::cout << "Chaos Engine starting on port 8003..." << std::endl;
    svr.listen("0.0.0.0", 8003);
    
    return 0;
}
