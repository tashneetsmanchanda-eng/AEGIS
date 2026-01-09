"""
Verification script to test that dotenv and openai are properly installed
"""

try:
    import dotenv
    print("✅ Successfully imported dotenv")
except ImportError as e:
    print(f"❌ Failed to import dotenv: {e}")
    exit(1)

try:
    import openai
    print("✅ Successfully imported openai")
except ImportError as e:
    print(f"❌ Failed to import openai: {e}")
    exit(1)

print("\n🎉 All imports successful! Environment is properly configured.")

