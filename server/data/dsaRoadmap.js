module.exports = [
  {
    "id": "stage-0",
    "title": "STAGE 0 — PROGRAMMING THINKING",
    "topics": [
      {
        "id": "programming-basics",
        "title": "Programming Basics",
        "description": "Programming thinking is the ability to break down a problem into a sequence of small, unambiguous instructions that a computer can execute.",
        "whyItMatters": "Before learning complex algorithms, you must be comfortable expressing logic through variables, loops, conditional statements, and functions.",
        "connection": "This is the starting point of your journey. Every algorithm you will ever write builds directly upon these core building blocks.",
        "whenToUse": "Whenever you write code to process data or solve a problem.",
        "recognitionClues": "Look for basic tasks requiring iteration, counting, or conditional checks before using specialized data structures.",
        "coreIdea": "Write clear loops, maintain clean state variables, handle edge cases (like empty inputs or zero), and understand how many operations your code runs.",
        "codeTemplates": {
          "python": "# Basic Loop & Counter in Python\ndef count_evens(nums):\n    count = 0\n    for num in nums:\n        if num % 2 == 0:\n            count += 1\n    return count",
          "java": "// Basic Loop & Counter in Java\npublic int countEvens(int[] nums) {\n    int count = 0;\n    for (int num : nums) {\n        if (num % 2 == 0) {\n            count++;\n        }\n    }\n    return count;\n}",
          "cpp": "// Basic Loop & Counter in C++\nint countEvens(const vector<int>& nums) {\n    int count = 0;\n    for (int num : nums) {\n        if (num % 2 == 0) {\n            count++;\n        }\n    }\n    return count;\n}",
          "c": "// Basic Loop & Counter in C\nint countEvens(int* nums, int size) {\n    int count = 0;\n    for (int i = 0; i < size; i++) {\n        if (nums[i] % 2 == 0) {\n            count++;\n        }\n    }\n    return count;\n}"
        },
        "commonMistakes": [
          "Off-by-one errors in loop boundaries (e.g. using <= size instead of < size).",
          "Forgetting to initialize state variables before starting a loop.",
          "Not handling empty arrays or null inputs."
        ],
        "problems": []
      }
    ]
  },
  {
    "id": "stage-1",
    "title": "STAGE 1 — ARRAYS",
    "topics": [
      {
        "id": "array-traversal",
        "title": "Array Traversal",
        "description": "Array traversal means visiting each element in an array one by one from start to finish to examine or accumulate values.",
        "whyItMatters": "Arrays store contiguous memory elements. Traversing an array sequentially is the most fundamental way to inspect or aggregate data.",
        "connection": "You know basic programming loops. Array Traversal applies those loops to continuous blocks of memory to compute sums, maximums, or running totals.",
        "whenToUse": "Use array traversal when you need to inspect every item in a dataset once.",
        "recognitionClues": "Calculate running sum, find maximum/minimum element, count matching elements, compute customer wealth.",
        "coreIdea": "Initialize an accumulator or tracking variable before iterating. Step through each element, update the tracker, and return the result.",
        "codeTemplates": {
          "python": "def array_traversal(nums):\n    running_sum = 0\n    result = []\n    for val in nums:\n        running_sum += val\n        result.append(running_sum)\n    return result",
          "java": "public int[] arrayTraversal(int[] nums) {\n    int[] result = new int[nums.length];\n    int runningSum = 0;\n    for (int i = 0; i < nums.length; i++) {\n        runningSum += nums[i];\n        result[i] = runningSum;\n    }\n    return result;\n}",
          "cpp": "vector<int> arrayTraversal(vector<int>& nums) {\n    vector<int> result(nums.size());\n    int runningSum = 0;\n    for (size_t i = 0; i < nums.size(); i++) {\n        runningSum += nums[i];\n        result[i] = runningSum;\n    }\n    return result;\n}",
          "c": "int* arrayTraversal(int* nums, int numsSize, int* returnSize) {\n    int* result = (int*)malloc(numsSize * sizeof(int));\n    *returnSize = numsSize;\n    int runningSum = 0;\n    for (int i = 0; i < numsSize; i++) {\n        runningSum += nums[i];\n        result[i] = runningSum;\n    }\n    return result;\n}"
        },
        "commonMistakes": [
          "Modifying loop variables inside the loop body, leading to skipped elements.",
          "Re-initializing the accumulator variable inside the loop instead of outside.",
          "Accessing indices out of bounds."
        ],
        "problems": [
          {
            "title": "Running Sum of 1d Array",
            "slug": "running-sum-of-1d-array",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/running-sum-of-1d-array/",
            "order": 1,
            "whyThisProblem": "Directly applies basic array traversal by accumulating a running total at each index.",
            "learningObjective": "Master the algorithmic pattern of Array Traversal using Running Sum of 1d Array.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Array Traversal pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Array Traversal core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Array Traversal pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Richest Customer Wealth",
            "slug": "richest-customer-wealth",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/richest-customer-wealth/",
            "order": 2,
            "whyThisProblem": "Teaches nested array traversal (row by row sum) to find a global maximum.",
            "learningObjective": "Master the algorithmic pattern of Array Traversal using Richest Customer Wealth.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Array Traversal pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Array Traversal core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Array Traversal pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Find Numbers with Even Number of Digits",
            "slug": "find-numbers-with-even-number-of-digits",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/find-numbers-with-even-number-of-digits/",
            "order": 3,
            "whyThisProblem": "Combines array iteration with per-element condition checking.",
            "learningObjective": "Master the algorithmic pattern of Array Traversal using Find Numbers with Even Number of Digits.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Array Traversal pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Array Traversal core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Array Traversal pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Maximum Product Difference Between Two Pairs",
            "slug": "maximum-product-difference-between-two-pairs",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/maximum-product-difference-between-two-pairs/",
            "order": 4,
            "whyThisProblem": "Shows how traversing to find the two largest and two smallest elements optimizes calculations.",
            "learningObjective": "Master the algorithmic pattern of Array Traversal using Maximum Product Difference Between Two Pairs.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Array Traversal pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Array Traversal core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Array Traversal pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      },
      {
        "id": "basic-array-manipulation",
        "title": "Basic Array Manipulation",
        "description": "Array manipulation involves modifying array elements in-place, removing unwanted values, shifting elements, or maintaining write pointers.",
        "whyItMatters": "Creating new arrays for every change wastes memory. In-place manipulation achieves O(1) extra space efficiency.",
        "connection": "Traversing allowed us to read data. Basic Array Manipulation teaches us how to write, shift, and reorder data inside the same array.",
        "whenToUse": "Use when a problem specifies modifying the input array in-place without allocating extra memory arrays.",
        "recognitionClues": "In-place removal, remove duplicates, move zeroes to end, merge sorted arrays without extra space.",
        "coreIdea": "Maintain a read pointer scanning through elements and a write pointer marking where the next valid element should be placed.",
        "codeTemplates": {
          "python": "def remove_val(nums, val):\n    write_idx = 0\n    for read_idx in range(len(nums)):\n        if nums[read_idx] != val:\n            nums[write_idx] = nums[read_idx]\n            write_idx += 1\n    return write_idx",
          "java": "public int removeVal(int[] nums, int val) {\n    int writeIdx = 0;\n    for (int readIdx = 0; readIdx < nums.length; readIdx++) {\n        if (nums[readIdx] != val) {\n            nums[writeIdx] = nums[readIdx];\n            writeIdx++;\n        }\n    }\n    return writeIdx;\n}",
          "cpp": "int removeVal(vector<int>& nums, int val) {\n    int writeIdx = 0;\n    for (int readIdx = 0; readIdx < nums.size(); readIdx++) {\n        if (nums[readIdx] != val) {\n            nums[writeIdx] = nums[readIdx];\n            writeIdx++;\n        }\n    }\n    return writeIdx;\n}",
          "c": "int removeVal(int* nums, int numsSize, int val) {\n    int writeIdx = 0;\n    for (int readIdx = 0; readIdx < numsSize; readIdx++) {\n        if (nums[readIdx] != val) {\n            nums[writeIdx] = nums[readIdx];\n            writeIdx++;\n        }\n    }\n    return writeIdx;\n}"
        },
        "commonMistakes": [
          "Trying to delete elements with array operations that shift elements repeatedly (O(N^2) complexity).",
          "Incrementing the write pointer unconditionally.",
          "Overwriting unread values when merging from left to right."
        ],
        "problems": [
          {
            "title": "Remove Element",
            "slug": "remove-element",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/remove-element/",
            "order": 1,
            "whyThisProblem": "The classic foundation problem for two-pointer reader/writer array manipulation.",
            "learningObjective": "Master the algorithmic pattern of Basic Array Manipulation using Remove Element.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Basic Array Manipulation pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Basic Array Manipulation core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Basic Array Manipulation pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Remove Duplicates from Sorted Array",
            "slug": "remove-duplicates-from-sorted-array",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
            "order": 2,
            "whyThisProblem": "Leverages sorted order to skip adjacent duplicate elements in-place.",
            "learningObjective": "Master the algorithmic pattern of Basic Array Manipulation using Remove Duplicates from Sorted Array.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Basic Array Manipulation pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Basic Array Manipulation core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Basic Array Manipulation pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Move Zeroes",
            "slug": "move-zeroes",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/move-zeroes/",
            "order": 3,
            "whyThisProblem": "Teaches how to push target values (zeroes) to the end while preserving relative ordering.",
            "learningObjective": "Master the algorithmic pattern of Basic Array Manipulation using Move Zeroes.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Basic Array Manipulation pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Basic Array Manipulation core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Basic Array Manipulation pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Merge Sorted Array",
            "slug": "merge-sorted-array",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/merge-sorted-array/",
            "order": 4,
            "whyThisProblem": "Introduces backward in-place writing to prevent overwriting unread elements.",
            "learningObjective": "Master the algorithmic pattern of Basic Array Manipulation using Merge Sorted Array.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Basic Array Manipulation pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Basic Array Manipulation core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Basic Array Manipulation pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-2",
    "title": "STAGE 2 — STRINGS",
    "topics": [
      {
        "id": "string-basics",
        "title": "String Basics",
        "description": "Strings are sequential sequences of characters. String manipulation includes character comparisons, conversions, prefix matching, and palindrome checks.",
        "whyItMatters": "Text parsing and string processing are omnipresent in software development and technical interviews.",
        "connection": "Strings can be treated like arrays of characters. Everything you learned in Array Traversal applies directly to strings, with extra focus on character encoding and immutability.",
        "whenToUse": "Use when processing textual data, matching patterns, or checking character properties.",
        "recognitionClues": "Palindromes, prefixes, string reversal, anagram checks, character frequency comparisons.",
        "coreIdea": "Iterate using pointers or character indexes. Filter non-alphanumeric characters or convert cases when comparing text.",
        "codeTemplates": {
          "python": "def is_palindrome(s):\n    cleaned = [ch.lower() for ch in s if ch.isalnum()]\n    return cleaned == cleaned[::-1]",
          "java": "public boolean isPalindrome(String s) {\n    int left = 0, right = s.length() - 1;\n    while (left < right) {\n        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;\n        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;\n        if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) return false;\n        left++; right--;\n    }\n    return true;\n}",
          "cpp": "bool isPalindrome(string s) {\n    int left = 0, right = s.length() - 1;\n    while (left < right) {\n        while (left < right && !isalnum(s[left])) left++;\n        while (left < right && !isalnum(s[right])) right--;\n        if (tolower(s[left]) != tolower(s[right])) return false;\n        left++; right--;\n    }\n    return true;\n}",
          "c": "bool isPalindrome(char* s) {\n    int left = 0, right = strlen(s) - 1;\n    while (left < right) {\n        while (left < right && !isalnum(s[left])) left++;\n        while (left < right && !isalnum(s[right])) right--;\n        if (tolower(s[left]) != tolower(s[right])) return false;\n        left++; right--;\n    }\n    return true;\n}"
        },
        "commonMistakes": [
          "Forgetting that strings are immutable in languages like Python and Java (creating string copies in loops causes O(N^2) time).",
          "Not ignoring punctuation or uppercase/lowercase differences when requested.",
          "Index out-of-bounds when trimming whitespace or punctuation."
        ],
        "problems": [
          {
            "title": "Reverse String",
            "slug": "reverse-string",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/reverse-string/",
            "order": 1,
            "whyThisProblem": "Simple character array swap demonstrating basic two-pointer string traversal.",
            "learningObjective": "Master the algorithmic pattern of String Basics using Reverse String.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the String Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the String Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the String Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Valid Palindrome",
            "slug": "valid-palindrome",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/valid-palindrome/",
            "order": 2,
            "whyThisProblem": "Teaches character filtering and case-insensitive comparison from both ends.",
            "learningObjective": "Master the algorithmic pattern of String Basics using Valid Palindrome.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the String Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the String Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the String Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Longest Common Prefix",
            "slug": "longest-common-prefix",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/longest-common-prefix/",
            "order": 3,
            "whyThisProblem": "Demonstrates vertical vs horizontal character comparison across multiple strings.",
            "learningObjective": "Master the algorithmic pattern of String Basics using Longest Common Prefix.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the String Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the String Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the String Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Valid Anagram",
            "slug": "valid-anagram",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/valid-anagram/",
            "order": 4,
            "whyThisProblem": "Introduces character frequency counting as a bridge toward Hashing.",
            "learningObjective": "Master the algorithmic pattern of String Basics using Valid Anagram.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the String Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the String Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the String Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-3",
    "title": "STAGE 3 — HASHING",
    "topics": [
      {
        "id": "hashset",
        "title": "HashSet",
        "description": "A HashSet is a data structure that stores unique items and allows checking for existence in O(1) average time.",
        "whyItMatters": "Repeatedly searching an array takes O(N) time. A HashSet remembers what we have seen before in O(1) time.",
        "connection": "You know how to scan arrays for values. But asking \"Have we seen this element before?\" takes O(N) linear scan. HashSet gives us instant O(1) answers.",
        "whenToUse": "Use HashSet whenever you need to track unique items or check membership instantly.",
        "recognitionClues": "Check uniqueness, detect duplicate values, array intersection, loop detection in number sequences.",
        "coreIdea": "Store encountered elements in a Set. Before adding a new element, perform an O(1) lookup to check if it already exists.",
        "codeTemplates": {
          "python": "def contains_duplicate(nums):\n    seen = set()\n    for num in nums:\n        if num in seen:\n            return True\n        seen.add(num)\n    return False",
          "java": "public boolean containsDuplicate(int[] nums) {\n    Set<Integer> seen = new HashSet<>();\n    for (int num : nums) {\n        if (seen.contains(num)) return true;\n        seen.add(num);\n    }\n    return false;\n}",
          "cpp": "bool containsDuplicate(vector<int>& nums) {\n    unordered_set<int> seen;\n    for (int num : nums) {\n        if (seen.count(num)) return true;\n        seen.insert(num);\n    }\n    return false;\n}",
          "c": "// In C, use a hash table array or hash map library\nbool containsDuplicate(int* nums, int numsSize) {\n    // Conceptual template: insertion into hash set table\n    return false;\n}"
        },
        "commonMistakes": [
          "Forgetting that average O(1) set lookup requires a good hash function (in C++, std::set is O(log N), use std::unordered_set for O(1)).",
          "Not clearing the set between test cases or iterations.",
          "Modifying elements while they are stored inside a set."
        ],
        "problems": [
          {
            "title": "Contains Duplicate",
            "slug": "contains-duplicate",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/contains-duplicate/",
            "order": 1,
            "whyThisProblem": "The absolute fundamental problem showing O(N) linear time duplicate checking vs O(N^2) nested loops.",
            "learningObjective": "Master the algorithmic pattern of HashSet using Contains Duplicate.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the HashSet pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the HashSet core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the HashSet pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Happy Number",
            "slug": "happy-number",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/happy-number/",
            "order": 2,
            "whyThisProblem": "Shows how a HashSet detects infinite cycles in mathematical sequences.",
            "learningObjective": "Master the algorithmic pattern of HashSet using Happy Number.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the HashSet pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the HashSet core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the HashSet pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Intersection of Two Arrays",
            "slug": "intersection-of-two-arrays",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/intersection-of-two-arrays/",
            "order": 3,
            "whyThisProblem": "Demonstrates set intersection to find common elements efficiently.",
            "learningObjective": "Master the algorithmic pattern of HashSet using Intersection of Two Arrays.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the HashSet pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the HashSet core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the HashSet pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      },
      {
        "id": "hashmap",
        "title": "HashMap",
        "description": "A HashMap stores key-value pairs (key -> value), allowing instant O(1) lookup of associated information.",
        "whyItMatters": "HashSet tells you \"if\" an element exists. HashMap tells you \"where\" it exists (index) or \"how many times\" it appears (frequency).",
        "connection": "HashSet helped us remember presence. HashMap expands this idea to remember associated data (value -> count or value -> index).",
        "whenToUse": "Use HashMap for frequency counting, index lookups, complementary pair matching, and grouping items.",
        "recognitionClues": "Two sum target matching, frequency counting, majority element, anagram grouping, pattern mapping.",
        "coreIdea": "Map keys to values. Look up complementary target values (e.g. target - current) in O(1) time while building the map.",
        "codeTemplates": {
          "python": "def two_sum(nums, target):\n    seen = {} # val -> index\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
          "java": "public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> seen = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int diff = target - nums[i];\n        if (seen.containsKey(diff)) {\n            return new int[]{seen.get(diff), i};\n        }\n        seen.put(nums[i], i);\n    }\n    return new int[0];\n}",
          "cpp": "vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (seen.count(diff)) {\n            return {seen[diff], i};\n        }\n        seen[nums[i]] = i;\n    }\n    return {};\n}",
          "c": "// C Hash Map implementation using array of structs or khash\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Conceptual template: key-value hash lookup\n    *returnSize = 0;\n    return NULL;\n}"
        },
        "commonMistakes": [
          "Inserting the current element into the map before checking for its complement (causing an element to match with itself).",
          "Using std::map in C++ (O(log N)) instead of std::unordered_map (O(1)).",
          "Using complex objects as hash keys without overriding hash/equals methods properly."
        ],
        "problems": [
          {
            "title": "Two Sum",
            "slug": "two-sum",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
            "order": 1,
            "whyThisProblem": "The iconic problem demonstrating HashMap complement lookup (target - num).",
            "learningObjective": "Master the algorithmic pattern of HashMap using Two Sum.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the HashMap pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the HashMap core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the HashMap pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Majority Element",
            "slug": "majority-element",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/majority-element/",
            "order": 2,
            "whyThisProblem": "Teaches frequency counting with a HashMap before exploring Boyer-Moore voting.",
            "learningObjective": "Master the algorithmic pattern of HashMap using Majority Element.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the HashMap pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the HashMap core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the HashMap pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Isomorphic Strings",
            "slug": "isomorphic-strings",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/isomorphic-strings/",
            "order": 3,
            "whyThisProblem": "Shows bidirectional key-value character mapping.",
            "learningObjective": "Master the algorithmic pattern of HashMap using Isomorphic Strings.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the HashMap pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the HashMap core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the HashMap pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Group Anagrams",
            "slug": "group-anagrams",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/group-anagrams/",
            "order": 4,
            "whyThisProblem": "Teaches using sorted strings or character count tuples as HashMap keys.",
            "learningObjective": "Master the algorithmic pattern of HashMap using Group Anagrams.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the HashMap pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the HashMap core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the HashMap pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-4",
    "title": "STAGE 4 — TWO POINTERS",
    "topics": [
      {
        "id": "two-pointers",
        "title": "Two Pointers",
        "description": "Two Pointers is a pattern where two index pointers traverse a data structure concurrently to eliminate unnecessary comparisons.",
        "whyItMatters": "Checking every pair of elements takes O(N^2) time. Two Pointers reduces pair processing on sorted/structured data to O(N) time.",
        "connection": "HashMap helped us find pairs in un-sorted data using O(N) extra space. Two Pointers allows us to find pairs in sorted data using O(1) extra space.",
        "whenToUse": "Use when dealing with sorted arrays, palindromes, or when searching for element pairs from both ends.",
        "recognitionClues": "Sorted array, pair sum, opposite ends, left/right pointers, container water area, 3Sum.",
        "coreIdea": "Set left = 0 and right = n - 1. Compare values at both pointers. If sum is too small advance left; if too large decrement right.",
        "codeTemplates": {
          "python": "def two_sum_sorted(nums, target):\n    left, right = 0, len(nums) - 1\n    while left < right:\n        curr_sum = nums[left] + nums[right]\n        if curr_sum == target:\n            return [left + 1, right + 1]\n        elif curr_sum < target:\n            left += 1\n        else:\n            right -= 1\n    return []",
          "java": "public int[] twoSumSorted(int[] nums, int target) {\n    int left = 0, right = nums.length - 1;\n    while (left < right) {\n        int sum = nums[left] + nums[right];\n        if (sum == target) return new int[]{left + 1, right + 1};\n        else if (sum < target) left++;\n        else right--;\n    }\n    return new int[0];\n}",
          "cpp": "vector<int> twoSumSorted(vector<int>& nums, int target) {\n    int left = 0, right = nums.size() - 1;\n    while (left < right) {\n        int sum = nums[left] + nums[right];\n        if (sum == target) return {left + 1, right + 1};\n        else if (sum < target) left++;\n        else right--;\n    }\n    return {};\n}",
          "c": "int* twoSumSorted(int* nums, int numsSize, int target, int* returnSize) {\n    int left = 0, right = numsSize - 1;\n    while (left < right) {\n        int sum = nums[left] + nums[right];\n        if (sum == target) {\n            int* res = (int*)malloc(2 * sizeof(int));\n            res[0] = left + 1; res[1] = right + 1;\n            *returnSize = 2;\n            return res;\n        }\n        else if (sum < target) left++;\n        else right--;\n    }\n    *returnSize = 0; return NULL;\n}"
        },
        "commonMistakes": [
          "Forgetting that the input array MUST be sorted for two-pointer pair searching to work.",
          "Moving the wrong pointer when condition fails.",
          "Not skipping duplicate elements in multi-pointer problems like 3Sum."
        ],
        "problems": [
          {
            "title": "Valid Palindrome",
            "slug": "valid-palindrome",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/valid-palindrome/",
            "order": 1,
            "whyThisProblem": "Revisits palindrome checks using opposite-end two-pointer iteration.",
            "learningObjective": "Master the algorithmic pattern of Two Pointers using Valid Palindrome.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Two Pointers pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Two Pointers core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Two Pointers pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Two Sum II - Input Array Is Sorted",
            "slug": "two-sum-ii-input-array-is-sorted",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
            "order": 2,
            "whyThisProblem": "Direct application of two pointers on a sorted array with O(1) space.",
            "learningObjective": "Master the algorithmic pattern of Two Pointers using Two Sum II - Input Array Is Sorted.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Two Pointers pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Two Pointers core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Two Pointers pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Remove Duplicates from Sorted Array",
            "slug": "remove-duplicates-from-sorted-array",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
            "order": 3,
            "whyThisProblem": "Same-direction fast/slow pointers for array compaction.",
            "learningObjective": "Master the algorithmic pattern of Two Pointers using Remove Duplicates from Sorted Array.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Two Pointers pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Two Pointers core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Two Pointers pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Container With Most Water",
            "slug": "container-with-most-water",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/container-with-most-water/",
            "order": 4,
            "whyThisProblem": "Greedy two-pointer movement based on container height limits.",
            "learningObjective": "Master the algorithmic pattern of Two Pointers using Container With Most Water.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Two Pointers pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Two Pointers core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Two Pointers pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "3Sum",
            "slug": "3sum",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/3sum/",
            "order": 5,
            "whyThisProblem": "Fixes one element and applies two pointers for the remaining pair.",
            "learningObjective": "Master the algorithmic pattern of Two Pointers using 3Sum.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Two Pointers pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Two Pointers core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Two Pointers pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-5",
    "title": "STAGE 5 — SLIDING WINDOW",
    "topics": [
      {
        "id": "fixed-window",
        "title": "Fixed Window",
        "explanation": "Fixed Sliding Window maintains a contiguous sub-range (window) of a fixed size K as it moves across an array or string.",
        "whyItMatters": "Recomputing sums or metrics for every subarray of length K takes O(N * K). Sliding the window reuse calculations in O(N) time.",
        "connection": "Two Pointers taught us to maintain boundary positions. Fixed Sliding Window keeps the boundary distance fixed at K and slides both pointers right.",
        "whenToUse": "Use when asked for the maximum/minimum/average of all contiguous subarrays of fixed size K.",
        "recognitionClues": "Contiguous subarray of size K, maximum average of length K, fixed window length.",
        "coreIdea": "Compute sum of first K elements. Then slide right: add new element coming into window, subtract old element leaving window.",
        "codeTemplates": {
          "python": "def max_sub_array_avg(nums, k):\n    curr_sum = sum(nums[:k])\n    max_sum = curr_sum\n    for i in range(k, len(nums)):\n        curr_sum += nums[i] - nums[i - k]\n        max_sum = max(max_sum, curr_sum)\n    return max_sum / k",
          "java": "public double findMaxAverage(int[] nums, int k) {\n    double sum = 0;\n    for (int i = 0; i < k; i++) sum += nums[i];\n    double max = sum;\n    for (int i = k; i < nums.length; i++) {\n        sum += nums[i] - nums[i - k];\n        max = Math.max(max, sum);\n    }\n    return max / k;\n}",
          "cpp": "double findMaxAverage(vector<int>& nums, int k) {\n    double sum = 0;\n    for (int i = 0; i < k; i++) sum += nums[i];\n    double max = sum;\n    for (int i = k; i < nums.size(); i++) {\n        sum += nums[i] - nums[i - k];\n        max = std::max(max, sum);\n    }\n    return max / k;\n}",
          "c": "double findMaxAverage(int* nums, int numsSize, int k) {\n    double sum = 0;\n    for (int i = 0; i < k; i++) sum += nums[i];\n    double max = sum;\n    for (int i = k; i < numsSize; i++) {\n        sum += nums[i] - nums[i - k];\n        if (sum > max) max = sum;\n    }\n    return max / k;\n}"
        },
        "commonMistakes": [
          "Forgetting to subtract the element leaving the left side of the window.",
          "Incorrect loop start index when sliding after the initial K elements.",
          "Not handling arrays smaller than K."
        ],
        "problems": [
          {
            "title": "Maximum Average Subarray I",
            "slug": "maximum-average-subarray-i",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/maximum-average-subarray-i/",
            "order": 1,
            "whyThisProblem": "The quintessential fixed window problem (size K sum reuse).",
            "learningObjective": "Master the algorithmic pattern of Fixed Window using Maximum Average Subarray I.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Fixed Window pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Fixed Window core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Fixed Window pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Maximum Number of Vowels in a Substring of Given Length",
            "slug": "maximum-number-of-vowels-in-a-substring-of-given-length",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/",
            "order": 2,
            "whyThisProblem": "Applies fixed window sliding to character property counting in strings.",
            "learningObjective": "Master the algorithmic pattern of Fixed Window using Maximum Number of Vowels in a Substring of Given Length.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Fixed Window pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Fixed Window core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Fixed Window pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      },
      {
        "id": "variable-window",
        "title": "Variable Window",
        "explanation": "Variable Sliding Window dynamically expands and shrinks the window boundaries based on problem constraints.",
        "whyItMatters": "Enables finding the longest or shortest contiguous subarray matching a condition in linear O(N) time.",
        "connection": "Fixed Window had a static size K. Variable Window grows (right pointer) to find valid states and shrinks (left pointer) when constraints are violated.",
        "whenToUse": "Use for problems asking for the longest or shortest substring/subarray satisfying a condition.",
        "recognitionClues": "Longest substring without repeating characters, minimum size subarray sum, contiguous subarray matching criteria.",
        "coreIdea": "Expand right pointer to include elements. When constraint is broken, shrink left pointer until window becomes valid again.",
        "codeTemplates": {
          "python": "def length_of_longest_substring(s):\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        if s[right] in char_map and char_map[s[right]] >= left:\n            left = char_map[s[right]] + 1\n        char_map[s[right]] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len",
          "java": "public int lengthOfLongestSubstring(String s) {\n    Map<Character, Integer> map = new HashMap<>();\n    int left = 0, maxLen = 0;\n    for (int right = 0; right < s.length(); right++) {\n        char c = s.charAt(right);\n        if (map.containsKey(c) && map.get(c) >= left) {\n            left = map.get(c) + 1;\n        }\n        map.put(c, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}",
          "cpp": "int lengthOfLongestSubstring(string s) {\n    unordered_map<char, int> map;\n    int left = 0, maxLen = 0;\n    for (int right = 0; right < s.length(); right++) {\n        if (map.count(s[right]) && map[s[right]] >= left) {\n            left = map[s[right]] + 1;\n        }\n        map[s[right]] = right;\n        maxLen = max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}",
          "c": "int lengthOfLongestSubstring(char* s) {\n    int lastSeen[256];\n    memset(lastSeen, -1, sizeof(lastSeen));\n    int left = 0, maxLen = 0, len = strlen(s);\n    for (int right = 0; right < len; right++) {\n        if (lastSeen[(unsigned char)s[right]] >= left) {\n            left = lastSeen[(unsigned char)s[right]] + 1;\n        }\n        lastSeen[(unsigned char)s[right]] = right;\n        if (right - left + 1 > maxLen) maxLen = right - left + 1;\n    }\n    return maxLen;\n}"
        },
        "commonMistakes": [
          "Not updating left pointer correctly when shrinking window.",
          "Updating maximum length before shrinking invalid window states.",
          "Using nested loops inside the window check instead of a while loop."
        ],
        "problems": [
          {
            "title": "Longest Substring Without Repeating Characters",
            "slug": "longest-substring-without-repeating-characters",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
            "order": 1,
            "whyThisProblem": "The classic variable window problem matching non-repeating character constraints.",
            "learningObjective": "Master the algorithmic pattern of Variable Window using Longest Substring Without Repeating Characters.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Variable Window pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Variable Window core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Variable Window pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Minimum Size Subarray Sum",
            "slug": "minimum-size-subarray-sum",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/minimum-size-subarray-sum/",
            "order": 2,
            "whyThisProblem": "Demonstrates shrinking the window to find the shortest valid subarray.",
            "learningObjective": "Master the algorithmic pattern of Variable Window using Minimum Size Subarray Sum.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Variable Window pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Variable Window core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Variable Window pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Longest Repeating Character Replacement",
            "slug": "longest-repeating-character-replacement",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/longest-repeating-character-replacement/",
            "order": 3,
            "whyThisProblem": "Combines character frequency tracking with window expansion limits.",
            "learningObjective": "Master the algorithmic pattern of Variable Window using Longest Repeating Character Replacement.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Variable Window pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Variable Window core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Variable Window pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-6",
    "title": "STAGE 6 — PREFIX SUM",
    "topics": [
      {
        "id": "prefix-sum",
        "title": "Prefix Sum",
        "explanation": "Prefix Sum precomputes cumulative running totals so any range sum query (sum between index i and j) can be answered in O(1) time.",
        "whyItMatters": "Calculating subarray sums repeatedly takes O(N) per query. Precomputing prefix sums reduces queries to O(1).",
        "connection": "Sliding Window answered contiguous range questions over moving windows. Prefix Sum answers arbitrary range sum questions anywhere in the array.",
        "whenToUse": "Use when you need to perform multiple range sum queries or find continuous subarrays summing to a target K.",
        "recognitionClues": "Range sum query, sum between indices i and j, subarray sum equals K, pivot index.",
        "coreIdea": "Build prefix array where prefix[i] = sum(nums[0..i-1]). Range sum(i, j) = prefix[j+1] - prefix[i]. Combine with HashMap for target sum K.",
        "codeTemplates": {
          "python": "def subarray_sum(nums, k):\n    count = 0\n    curr_sum = 0\n    prefix_map = {0: 1} # sum -> count\n    for num in nums:\n        curr_sum += num\n        if (curr_sum - k) in prefix_map:\n            count += prefix_map[curr_sum - k]\n        prefix_map[curr_sum] = prefix_map.get(curr_sum, 0) + 1\n    return count",
          "java": "public int subarraySum(int[] nums, int k) {\n    int count = 0, currSum = 0;\n    Map<Integer, Integer> map = new HashMap<>();\n    map.put(0, 1);\n    for (int num : nums) {\n        currSum += num;\n        if (map.containsKey(currSum - k)) {\n            count += map.get(currSum - k);\n        }\n        map.put(currSum, map.getOrDefault(currSum, 0) + 1);\n    }\n    return count;\n}",
          "cpp": "int subarraySum(vector<int>& nums, int k) {\n    int count = 0, currSum = 0;\n    unordered_map<int, int> map;\n    map[0] = 1;\n    for (int num : nums) {\n        currSum += num;\n        if (map.count(currSum - k)) {\n            count += map[currSum - k];\n        }\n        map[currSum]++;\n    }\n    return count;\n}",
          "c": "// Prefix sum array creation template\nvoid buildPrefixSum(int* nums, int size, int* prefix) {\n    prefix[0] = 0;\n    for (int i = 0; i < size; i++) {\n        prefix[i + 1] = prefix[i] + nums[i];\n    }\n}"
        },
        "commonMistakes": [
          "Forgetting to initialize prefix map with {0: 1} (missing subarrays starting from index 0).",
          "Off-by-one errors in 1-indexed prefix sum array bounds.",
          "Confusing prefix sums with sliding windows when negative numbers are present."
        ],
        "problems": [
          {
            "title": "Find Pivot Index",
            "slug": "find-pivot-index",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/find-pivot-index/",
            "order": 1,
            "whyThisProblem": "Basic running sum comparison where left sum equals right sum.",
            "learningObjective": "Master the algorithmic pattern of Prefix Sum using Find Pivot Index.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Prefix Sum pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Prefix Sum core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Prefix Sum pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Range Sum Query - Immutable",
            "slug": "range-sum-query-immutable",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/range-sum-query-immutable/",
            "order": 2,
            "whyThisProblem": "Direct O(1) range sum precomputation class structure.",
            "learningObjective": "Master the algorithmic pattern of Prefix Sum using Range Sum Query - Immutable.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Prefix Sum pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Prefix Sum core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Prefix Sum pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Subarray Sum Equals K",
            "slug": "subarray-sum-equals-k",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/subarray-sum-equals-k/",
            "order": 3,
            "whyThisProblem": "Combines Prefix Sum with HashMap complement lookup for target sum K.",
            "learningObjective": "Master the algorithmic pattern of Prefix Sum using Subarray Sum Equals K.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Prefix Sum pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Prefix Sum core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Prefix Sum pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-7",
    "title": "STAGE 7 — SORTING + GREEDY",
    "topics": [
      {
        "id": "sorting-strategy",
        "title": "Sorting as a Strategy",
        "explanation": "Sorting orders unstructured data, enabling predictable sequential decision-making and interval merging.",
        "whyItMatters": "Unsorted data requires scanning everything. Sorting brings order so adjacent elements share properties.",
        "connection": "Prefix Sum precomputed totals. Sorting reorders items so adjacent elements share similarities (like overlapping intervals).",
        "whenToUse": "Use when sorting simplifies matching, grouping, or detecting overlaps.",
        "recognitionClues": "Merge intervals, sort colors, assign cookies, overlapping ranges.",
        "coreIdea": "Sort array first (O(N log N)). Then iterate through sorted elements to make linear decisions.",
        "codeTemplates": {
          "python": "def merge_intervals(intervals):\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for interval in intervals:\n        if not merged or merged[-1][1] < interval[0]:\n            merged.append(interval)\n        else:\n            merged[-1][1] = max(merged[-1][1], interval[1])\n    return merged",
          "java": "public int[][] merge(int[][] intervals) {\n    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n    List<int[]> merged = new ArrayList<>();\n    for (int[] interval : intervals) {\n        if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {\n            merged.add(interval);\n        } else {\n            merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], interval[1]);\n        }\n    }\n    return merged.toArray(new int[merged.size()][]);\n}",
          "cpp": "vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end());\n    vector<vector<int>> merged;\n    for (auto& interval : intervals) {\n        if (merged.empty() || merged.back()[1] < interval[0]) {\n            merged.push_back(interval);\n        } else {\n            merged.back()[1] = max(merged.back()[1], interval[1]);\n        }\n    }\n    return merged;\n}",
          "c": "// Sort intervals using qsort and merge sequentially\nint compareIntervals(const void* a, const void* b) {\n    return ((int**)a)[0][0] - ((int**)b)[0][0];\n}"
        },
        "commonMistakes": [
          "Forgetting that sorting mutates original indices.",
          "Not accounting for interval end boundary equality.",
          "Assuming sorting makes every algorithm faster when O(N) linear structures exist."
        ],
        "problems": [
          {
            "title": "Assign Cookies",
            "slug": "assign-cookies",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/assign-cookies/",
            "order": 1,
            "whyThisProblem": "Greedy matching of sorted greed factors and cookie sizes.",
            "learningObjective": "Master the algorithmic pattern of Sorting as a Strategy using Assign Cookies.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Sorting as a Strategy pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Sorting as a Strategy core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Sorting as a Strategy pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Merge Intervals",
            "slug": "merge-intervals",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/merge-intervals/",
            "order": 2,
            "whyThisProblem": "The classic sorting problem for interval start time alignment.",
            "learningObjective": "Master the algorithmic pattern of Sorting as a Strategy using Merge Intervals.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Sorting as a Strategy pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Sorting as a Strategy core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Sorting as a Strategy pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Sort Colors",
            "slug": "sort-colors",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/sort-colors/",
            "order": 3,
            "whyThisProblem": "Dutch National Flag 3-way partitioning algorithm.",
            "learningObjective": "Master the algorithmic pattern of Sorting as a Strategy using Sort Colors.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Sorting as a Strategy pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Sorting as a Strategy core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Sorting as a Strategy pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      },
      {
        "id": "greedy-thinking",
        "title": "Greedy Thinking",
        "explanation": "Greedy algorithms make the locally optimal choice at each step to arrive at a global solution.",
        "whyItMatters": "Avoids checking all possible choices (exponential) by proving local choices remain optimal.",
        "connection": "Sorting strategy showed how ordered choices work. Greedy Thinking applies optimal local choices directly as we iterate.",
        "whenToUse": "Use when local best choices can be mathematically proven to lead to global optimums.",
        "recognitionClues": "Stock buy/sell max profit, jump game reachable distance, gas station circuit.",
        "coreIdea": "Iterate and update global answer by picking local maximums/minimums at each step.",
        "codeTemplates": {
          "python": "def max_profit(prices):\n    min_price = float('inf')\n    max_prof = 0\n    for p in prices:\n        min_price = min(min_price, p)\n        max_prof = max(max_prof, p - min_price)\n    return max_prof",
          "java": "public int maxProfit(int[] prices) {\n    int minPrice = Integer.MAX_VALUE, maxProf = 0;\n    for (int p : prices) {\n        if (p < minPrice) minPrice = p;\n        else if (p - minPrice > maxProf) maxProf = p - minPrice;\n    }\n    return maxProf;\n}",
          "cpp": "int maxProfit(vector<int>& prices) {\n    int minPrice = INT_MAX, maxProf = 0;\n    for (int p : prices) {\n        minPrice = min(minPrice, p);\n        maxProf = max(maxProf, p - minPrice);\n    }\n    return maxProf;\n}",
          "c": "int maxProfit(int* prices, int pricesSize) {\n    int minPrice = 1e9, maxProf = 0;\n    for (int i = 0; i < pricesSize; i++) {\n        if (prices[i] < minPrice) minPrice = prices[i];\n        else if (prices[i] - minPrice > maxProf) maxProf = prices[i] - minPrice;\n    }\n    return maxProf;\n}"
        },
        "commonMistakes": [
          "Applying greedy logic to problems requiring Dynamic Programming (where local choice breaks global optimum).",
          "Not tracking boundary updates properly in jump games."
        ],
        "problems": [
          {
            "title": "Best Time to Buy and Sell Stock",
            "slug": "best-time-to-buy-and-sell-stock",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
            "order": 1,
            "whyThisProblem": "Tracks minimum price seen so far to greedily compute max profit.",
            "learningObjective": "Master the algorithmic pattern of Greedy Thinking using Best Time to Buy and Sell Stock.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Greedy Thinking pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Greedy Thinking core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Greedy Thinking pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Jump Game",
            "slug": "jump-game",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/jump-game/",
            "order": 2,
            "whyThisProblem": "Greedily extends maximum reachable index boundary.",
            "learningObjective": "Master the algorithmic pattern of Greedy Thinking using Jump Game.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Greedy Thinking pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Greedy Thinking core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Greedy Thinking pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Gas Station",
            "slug": "gas-station",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/gas-station/",
            "order": 3,
            "whyThisProblem": "Greedily identifies valid starting gas stations.",
            "learningObjective": "Master the algorithmic pattern of Greedy Thinking using Gas Station.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Greedy Thinking pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Greedy Thinking core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Greedy Thinking pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-8",
    "title": "STAGE 8 — STACK",
    "topics": [
      {
        "id": "stack-basics",
        "title": "Stack Basics",
        "explanation": "A Stack is a Last-In, First-Out (LIFO) linear data structure where elements are added and removed from the top.",
        "whyItMatters": "Essential for nested parsing, matching parentheses, expression evaluation, and tracking state history.",
        "connection": "Greedy processed elements sequentially forward. Stack allows us to remember recent elements and process them in reverse LIFO order.",
        "whenToUse": "Use Stack whenever encountering nested brackets, matching symbols, or reversing order of operation.",
        "recognitionClues": "Valid parentheses, nested structures, backspacing strings, min stack operations.",
        "coreIdea": "Push elements when opening nested contexts; pop elements to match against closing contexts.",
        "codeTemplates": {
          "python": "def is_valid_parentheses(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack",
          "java": "public boolean isValid(String s) {\n    Stack<Character> stack = new Stack<>();\n    for (char c : s.toCharArray()) {\n        if (c == '(') stack.push(')');\n        else if (c == '{') stack.push('}');\n        else if (c == '[') stack.push(']');\n        else if (stack.isEmpty() || stack.pop() != c) return false;\n    }\n    return stack.isEmpty();\n}",
          "cpp": "bool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(') st.push(')');\n        else if (c == '{') st.push('}');\n        else if (c == '[') st.push(']');\n        else {\n            if (st.empty() || st.top() != c) return false;\n            st.pop();\n        }\n    }\n    return st.empty();\n}",
          "c": "bool isValid(char* s) {\n    char stack[10000];\n    int top = -1;\n    for (int i = 0; s[i] != '\\0'; i++) {\n        if (s[i] == '(') stack[++top] = ')';\n        else if (s[i] == '{') stack[++top] = '}';\n        else if (s[i] == '[') stack[++top] = ']';\n        else {\n            if (top == -1 || stack[top--] != s[i]) return false;\n        }\n    }\n    return top == -1;\n}"
        },
        "commonMistakes": [
          "Popping from an empty stack.",
          "Not verifying the stack is completely empty at the end of matching.",
          "Confusing LIFO stack behavior with FIFO queue behavior."
        ],
        "problems": [
          {
            "title": "Valid Parentheses",
            "slug": "valid-parentheses",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/valid-parentheses/",
            "order": 1,
            "whyThisProblem": "The quintessential LIFO stack matching problem.",
            "learningObjective": "Master the algorithmic pattern of Stack Basics using Valid Parentheses.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Stack Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Stack Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Stack Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Baseball Game",
            "slug": "baseball-game",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/baseball-game/",
            "order": 2,
            "whyThisProblem": "Basic stack operations for tracking score record adjustments.",
            "learningObjective": "Master the algorithmic pattern of Stack Basics using Baseball Game.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Stack Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Stack Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Stack Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Min Stack",
            "slug": "min-stack",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/min-stack/",
            "order": 3,
            "whyThisProblem": "Auxiliary stack design to achieve O(1) getMin() operational efficiency.",
            "learningObjective": "Master the algorithmic pattern of Stack Basics using Min Stack.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Stack Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Stack Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Stack Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      },
      {
        "id": "monotonic-stack-intro",
        "title": "Monotonic Stack Introduction",
        "explanation": "A Monotonic Stack maintains elements strictly in increasing or decreasing order to quickly find previous or next greater/smaller elements.",
        "whyItMatters": "Finding the next greater element for all items linearly takes O(N) using a Monotonic Stack instead of O(N^2) nested loops.",
        "connection": "Stack Basics handled exact symbol matches. Monotonic Stack uses relative magnitude comparison to answer \"When is the next larger value?\".",
        "whenToUse": "Use when looking for next greater, next smaller, previous greater, or previous smaller elements.",
        "recognitionClues": "Next greater element, daily temperatures (days until warmer temperature), stock span.",
        "coreIdea": "Maintain stack indices. Pop smaller elements off stack when a larger element arrives, resolving their next greater relationship.",
        "codeTemplates": {
          "python": "def daily_temperatures(temperatures):\n    res = [0] * len(temperatures)\n    stack = [] # indices\n    for i, t in enumerate(temperatures):\n        while stack and temperatures[stack[-1]] < t:\n            prev_i = stack.pop()\n            res[prev_i] = i - prev_i\n        stack.append(i)\n    return res",
          "java": "public int[] dailyTemperatures(int[] temperatures) {\n    int[] res = new int[temperatures.length];\n    Stack<Integer> stack = new Stack<>();\n    for (int i = 0; i < temperatures.length; i++) {\n        while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {\n            int prevIdx = stack.pop();\n            res[prevIdx] = i - prevIdx;\n        }\n        stack.push(i);\n    }\n    return res;\n}",
          "cpp": "vector<int> dailyTemperatures(vector<int>& temperatures) {\n    vector<int> res(temperatures.size(), 0);\n    stack<int> st;\n    for (int i = 0; i < temperatures.size(); i++) {\n        while (!st.empty() && temperatures[st.top()] < temperatures[i]) {\n            int prevIdx = st.top(); st.pop();\n            res[prevIdx] = i - prevIdx;\n        }\n        st.push(i);\n    }\n    return res;\n}",
          "c": "int* dailyTemperatures(int* temperatures, int temperaturesSize, int* returnSize) {\n    int* res = (int*)calloc(temperaturesSize, sizeof(int));\n    int* stack = (int*)malloc(temperaturesSize * sizeof(int));\n    int top = -1;\n    *returnSize = temperaturesSize;\n    for (int i = 0; i < temperaturesSize; i++) {\n        while (top >= 0 && temperatures[stack[top]] < temperatures[i]) {\n            int prevIdx = stack[top--];\n            res[prevIdx] = i - prevIdx;\n        }\n        stack[++top] = i;\n    }\n    free(stack);\n    return res;\n}"
        },
        "commonMistakes": [
          "Storing values instead of indices in stack when distance/offset calculations are needed.",
          "Using < instead of <= in monotonicity checks when duplicates occur.",
          "Forgetting remaining elements in stack have no next greater element."
        ],
        "problems": [
          {
            "title": "Daily Temperatures",
            "slug": "daily-temperatures",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/daily-temperatures/",
            "order": 1,
            "whyThisProblem": "The classic monotonic stack problem for finding distance to next warmer temperature.",
            "learningObjective": "Master the algorithmic pattern of Monotonic Stack Introduction using Daily Temperatures.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Monotonic Stack Introduction pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Monotonic Stack Introduction core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Monotonic Stack Introduction pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Next Greater Element I",
            "slug": "next-greater-element-i",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/next-greater-element-i/",
            "order": 2,
            "whyThisProblem": "Combines monotonic stack precomputation with HashMap key matching.",
            "learningObjective": "Master the algorithmic pattern of Monotonic Stack Introduction using Next Greater Element I.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Monotonic Stack Introduction pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Monotonic Stack Introduction core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Monotonic Stack Introduction pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-9",
    "title": "STAGE 9 — BINARY SEARCH",
    "topics": [
      {
        "id": "basic-binary-search",
        "title": "Basic Binary Search",
        "explanation": "Binary Search finds a target in a sorted array by repeatedly dividing the search space in half in O(log N) time.",
        "whyItMatters": "Scanning 1,000,000 items sequentially takes up to 1,000,000 steps. Binary Search finds it in ~20 steps.",
        "connection": "Monotonic Stack gave O(N) answers for element ordering. Binary Search gives logarithmic O(log N) search speed over sorted arrays.",
        "whenToUse": "Use whenever searching in a sorted array or monotonic condition space.",
        "recognitionClues": "Sorted array, search in O(log N), find target position, bad version boundary.",
        "coreIdea": "Compute mid = left + (right - left)/2. If nums[mid] == target return mid; if target > nums[mid] search right half else left half.",
        "codeTemplates": {
          "python": "def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1",
          "java": "public int search(int[] nums, int target) {\n    int left = 0, right = nums.length - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}",
          "cpp": "int search(vector<int>& nums, int target) {\n    int left = 0, right = nums.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}",
          "c": "int search(int* nums, int numsSize, int target) {\n    int left = 0, right = numsSize - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}"
        },
        "commonMistakes": [
          "Using (left + right) / 2 causing integer overflow for large numbers.",
          "Using while (left < right) instead of while (left <= right) for basic target search.",
          "Incorrectly adjusting bounds (mid instead of mid + 1 or mid - 1) leading to infinite loops."
        ],
        "problems": [
          {
            "title": "Binary Search",
            "slug": "binary-search",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/binary-search/",
            "order": 1,
            "whyThisProblem": "Pure logarithmic search template implementation.",
            "learningObjective": "Master the algorithmic pattern of Basic Binary Search using Binary Search.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Basic Binary Search pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Basic Binary Search core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Basic Binary Search pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Search Insert Position",
            "slug": "search-insert-position",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/search-insert-position/",
            "order": 2,
            "whyThisProblem": "Teaches finding lower bound insertion index.",
            "learningObjective": "Master the algorithmic pattern of Basic Binary Search using Search Insert Position.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Basic Binary Search pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Basic Binary Search core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Basic Binary Search pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "First Bad Version",
            "slug": "first-bad-version",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/first-bad-version/",
            "order": 3,
            "whyThisProblem": "Applies binary search to boolean predicate transition boundary.",
            "learningObjective": "Master the algorithmic pattern of Basic Binary Search using First Bad Version.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Basic Binary Search pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Basic Binary Search core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Basic Binary Search pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      },
      {
        "id": "binary-search-variations",
        "title": "Binary Search Variations",
        "explanation": "Applies binary search principles to rotated sorted arrays, lower/upper range bounds, and complex monotonic decision spaces.",
        "whyItMatters": "Rotated or modified sorted arrays still contain monotonically sorted halves that can be searched in O(log N).",
        "connection": "Basic Binary Search searched simple sorted arrays. Variations adapt binary search logic to rotated or range-bound arrays.",
        "whenToUse": "Use when dealing with rotated sorted arrays or finding the first/last occurrences of duplicate targets.",
        "recognitionClues": "Rotated sorted array, search first and last index, minimum in rotated array.",
        "coreIdea": "Determine which half (left or right) is monotonically sorted. Check if target lies within that half.",
        "codeTemplates": {
          "python": "def search_rotated(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[left] <= nums[mid]:\n            if nums[left] <= target < nums[mid]:\n                right = mid - 1\n            else:\n                left = mid + 1\n        else:\n            if nums[mid] < target <= nums[right]:\n                left = mid + 1\n            else:\n                right = mid - 1\n    return -1",
          "java": "public int searchRotated(int[] nums, int target) {\n    int left = 0, right = nums.length - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[left] <= nums[mid]) {\n            if (nums[left] <= target && target < nums[mid]) right = mid - 1;\n            else left = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[right]) left = mid + 1;\n            else right = mid - 1;\n        }\n    }\n    return -1;\n}",
          "cpp": "int searchRotated(vector<int>& nums, int target) {\n    int left = 0, right = nums.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[left] <= nums[mid]) {\n            if (nums[left] <= target && target < nums[mid]) right = mid - 1;\n            else left = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[right]) left = mid + 1;\n            else right = mid - 1;\n        }\n    }\n    return -1;\n}",
          "c": "int searchRotated(int* nums, int numsSize, int target) {\n    int left = 0, right = numsSize - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[left] <= nums[mid]) {\n            if (nums[left] <= target && target < nums[mid]) right = mid - 1;\n            else left = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[right]) left = mid + 1;\n            else right = mid - 1;\n        }\n    }\n    return -1;\n}"
        },
        "commonMistakes": [
          "Not identifying which subarray half is sorted.",
          "Inefficient handling of duplicates (e.g. nums[left] == nums[mid] == nums[right]).",
          "Incorrect boundary inclusion conditions."
        ],
        "problems": [
          {
            "title": "Find First and Last Position of Element in Sorted Array",
            "slug": "find-first-and-last-position-of-element-in-sorted-array",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
            "order": 1,
            "whyThisProblem": "Teaches lower and upper bound binary searches.",
            "learningObjective": "Master the algorithmic pattern of Binary Search Variations using Find First and Last Position of Element in Sorted Array.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Binary Search Variations pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Binary Search Variations core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Binary Search Variations pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(log n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Search in Rotated Sorted Array",
            "slug": "search-in-rotated-sorted-array",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
            "order": 2,
            "whyThisProblem": "The classic rotated array search identifying sorted halves.",
            "learningObjective": "Master the algorithmic pattern of Binary Search Variations using Search in Rotated Sorted Array.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Binary Search Variations pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Binary Search Variations core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Binary Search Variations pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(log n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Find Minimum in Rotated Sorted Array",
            "slug": "find-minimum-in-rotated-sorted-array",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
            "order": 3,
            "whyThisProblem": "Uses binary search to find inflection points in rotated arrays.",
            "learningObjective": "Master the algorithmic pattern of Binary Search Variations using Find Minimum in Rotated Sorted Array.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Binary Search Variations pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Binary Search Variations core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Binary Search Variations pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(log n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-10",
    "title": "STAGE 10 — LINKED LIST",
    "topics": [
      {
        "id": "linked-list-basics",
        "title": "Linked List Basics",
        "explanation": "A Linked List is a linear data structure of nodes where each node contains data and a pointer reference to the next node.",
        "whyItMatters": "Unlike arrays, linked lists allow efficient O(1) insertions and deletions without contiguous memory allocation.",
        "connection": "Binary Search optimized array searching. Linked List shows alternative non-contiguous pointer data storage.",
        "whenToUse": "Use when frequent insertions/deletions at head/middle are required without reallocating contiguous memory.",
        "recognitionClues": "Node manipulations, list reversal, middle node traversal, node deletion.",
        "coreIdea": "Traverse using curr = curr.next. Use dummy head nodes to simplify head node additions/deletions.",
        "codeTemplates": {
          "python": "def reverse_list(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev",
          "java": "public ListNode reverseList(ListNode head) {\n    ListNode prev = null, curr = head;\n    while (curr != null) {\n        ListNode nxt = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}",
          "cpp": "ListNode* reverseList(ListNode* head) {\n    ListNode* prev = nullptr;\n    ListNode* curr = head;\n    while (curr) {\n        ListNode* nxt = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}",
          "c": "struct ListNode* reverseList(struct ListNode* head) {\n    struct ListNode* prev = NULL;\n    struct ListNode* curr = head;\n    while (curr) {\n        struct ListNode* nxt = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}"
        },
        "commonMistakes": [
          "Losing pointer references before overwriting node.next.",
          "Null pointer dereferencing when accessing node.next.",
          "Forgetting to update tail or head pointers."
        ],
        "problems": [
          {
            "title": "Design Linked List",
            "slug": "design-linked-list",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/design-linked-list/",
            "order": 1,
            "whyThisProblem": "Builds a full linked list class with node insertion and deletion methods.",
            "learningObjective": "Master the algorithmic pattern of Linked List Basics using Design Linked List.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Linked List Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Linked List Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Linked List Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Middle of the Linked List",
            "slug": "middle-of-the-linked-list",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/middle-of-the-linked-list/",
            "order": 2,
            "whyThisProblem": "Introductory fast and slow pointer traversal for distance finding.",
            "learningObjective": "Master the algorithmic pattern of Linked List Basics using Middle of the Linked List.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Linked List Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Linked List Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Linked List Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Reverse Linked List",
            "slug": "reverse-linked-list",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/reverse-linked-list/",
            "order": 3,
            "whyThisProblem": "The essential iterative pointer reversal pattern.",
            "learningObjective": "Master the algorithmic pattern of Linked List Basics using Reverse Linked List.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Linked List Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Linked List Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Linked List Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      },
      {
        "id": "fast-and-slow-pointers",
        "title": "Fast and Slow Pointers",
        "explanation": "Fast and Slow Pointers (Floyd's Tortoise and Hare) uses two pointers advancing at different speeds (1 step vs 2 steps).",
        "whyItMatters": "Detects cycles and finds middle elements in linked lists in O(N) time and O(1) memory.",
        "connection": "Linked List Basics showed linear traversal. Fast and Slow Pointers adds relative speed traversal for cycle detection.",
        "whenToUse": "Use for cycle detection in linked lists or finding N-th node from end.",
        "recognitionClues": "Linked list cycle, middle of linked list, remove Nth node from end, intersection point.",
        "coreIdea": "Move slow pointer 1 step and fast pointer 2 steps. If fast meets slow, a cycle exists.",
        "codeTemplates": {
          "python": "def has_cycle(head):\n    slow, fast = head, head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False",
          "java": "public boolean hasCycle(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow == fast) return true;\n    }\n    return false;\n}",
          "cpp": "bool hasCycle(ListNode *head) {\n    ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) return true;\n    }\n    return false;\n}",
          "c": "bool hasCycle(struct ListNode *head) {\n    struct ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) return true;\n    }\n    return false;\n}"
        },
        "commonMistakes": [
          "Not checking if fast or fast.next is null before calling fast.next.next (NullPointerException).",
          "Starting pointers at wrong initial positions in cycle entry calculations."
        ],
        "problems": [
          {
            "title": "Linked List Cycle",
            "slug": "linked-list-cycle",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/linked-list-cycle/",
            "order": 1,
            "whyThisProblem": "The classic Floyd tortoise & hare cycle detection implementation.",
            "learningObjective": "Master the algorithmic pattern of Fast and Slow Pointers using Linked List Cycle.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Fast and Slow Pointers pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Fast and Slow Pointers core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Fast and Slow Pointers pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Remove Nth Node From End of List",
            "slug": "remove-nth-node-from-end-of-list",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
            "order": 2,
            "whyThisProblem": "Fixed offset two-pointer traversal for single-pass node deletion.",
            "learningObjective": "Master the algorithmic pattern of Fast and Slow Pointers using Remove Nth Node From End of List.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Fast and Slow Pointers pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Fast and Slow Pointers core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Fast and Slow Pointers pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Intersection of Two Linked Lists",
            "slug": "intersection-of-two-linked-lists",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
            "order": 3,
            "whyThisProblem": "Two-pointer length alignment for finding common intersection nodes.",
            "learningObjective": "Master the algorithmic pattern of Fast and Slow Pointers using Intersection of Two Linked Lists.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Fast and Slow Pointers pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Fast and Slow Pointers core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Fast and Slow Pointers pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-11",
    "title": "STAGE 11 — QUEUE + BFS THINKING",
    "topics": [
      {
        "id": "queue-basics",
        "title": "Queue Basics",
        "explanation": "A Queue is a First-In, First-Out (FIFO) linear data structure where elements are added at the back and removed from the front.",
        "whyItMatters": "Essential for level-order Breadth-First Search (BFS) and sequential event processing.",
        "connection": "Stack processed elements LIFO (most recent first). Queue processes elements FIFO (oldest first), laying the groundwork for level-by-level BFS traversal.",
        "whenToUse": "Use Queue for order-preserving simulations and level-by-level graph/tree explorations.",
        "recognitionClues": "First In First Out, number of recent calls, implement queue using stacks, level order.",
        "coreIdea": "Enqueue items at back; dequeue items from front. Maintain strict FIFO sequence.",
        "codeTemplates": {
          "python": "from collections import deque\n\nclass RecentCounter:\n    def __init__(self):\n        self.q = deque()\n\n    def ping(self, t: int) -> int:\n        self.q.append(t)\n        while self.q[0] < t - 3000:\n            self.q.popleft()\n        return len(self.q)",
          "java": "class RecentCounter {\n    private Queue<Integer> q = new LinkedList<>();\n\n    public int ping(int t) {\n        q.add(t);\n        while (q.peek() < t - 3000) {\n            q.poll();\n        }\n        return q.size();\n    }",
          "cpp": "class RecentCounter {\n    queue<int> q;\npublic:\n    int ping(int t) {\n        q.push(t);\n        while (q.front() < t - 3000) {\n            q.pop();\n        }\n        return q.size();\n    }\n};",
          "c": "// Queue implementation structure in C using array/head/tail pointers"
        },
        "commonMistakes": [
          "Popping from an empty queue.",
          "Using array shifts (shift() in JS or pop(0) in Python) causing O(N) dequeue time instead of O(1) double-ended queue."
        ],
        "problems": [
          {
            "title": "Number of Recent Calls",
            "slug": "number-of-recent-calls",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/number-of-recent-calls/",
            "order": 1,
            "whyThisProblem": "Teaches sliding time window simulation using FIFO queue eviction.",
            "learningObjective": "Master the algorithmic pattern of Queue Basics using Number of Recent Calls.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Queue Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Queue Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Queue Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Implement Queue using Stacks",
            "slug": "implement-queue-using-stacks",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/implement-queue-using-stacks/",
            "order": 2,
            "whyThisProblem": "Reinforces FIFO vs LIFO operations by building a Queue with two Stacks.",
            "learningObjective": "Master the algorithmic pattern of Queue Basics using Implement Queue using Stacks.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Queue Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Queue Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Queue Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-12",
    "title": "STAGE 12 — RECURSION",
    "topics": [
      {
        "id": "recursion-basics",
        "title": "Recursion",
        "explanation": "Recursion is a programming technique where a function calls itself to solve smaller sub-instances of the same problem.",
        "whyItMatters": "Fundamental for tree traversals, divide-and-conquer algorithms, backtracking, and dynamic programming.",
        "connection": "Queue handled iterative FIFO sequences. Recursion uses the system call stack to evaluate nested subproblems naturally.",
        "whenToUse": "Use when a problem can be broken into identical smaller subproblems with clear base conditions.",
        "recognitionClues": "Fibonacci numbers, power functions, climbing stairs, recursive subproblems.",
        "coreIdea": "Define 1) Base Case (when to stop), and 2) Recursive Step (calling self with smaller input).",
        "codeTemplates": {
          "python": "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)",
          "java": "public int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n - 1) + fib(n - 2);\n}",
          "cpp": "int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n - 1) + fib(n - 2);\n}",
          "c": "int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n - 1) + fib(n - 2);\n}"
        },
        "commonMistakes": [
          "Missing base cases leading to infinite recursion and StackOverflowError.",
          "Not shrinking problem inputs in recursive calls.",
          "Recomputing identical subproblems repeatedly without memoization."
        ],
        "problems": [
          {
            "title": "Fibonacci Number",
            "slug": "fibonacci-number",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/fibonacci-number/",
            "order": 1,
            "whyThisProblem": "The classic introductory recurrence relation.",
            "learningObjective": "Master the algorithmic pattern of Recursion using Fibonacci Number.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Recursion pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Recursion core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Recursion pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Power of Two",
            "slug": "power-of-two",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/power-of-two/",
            "order": 2,
            "whyThisProblem": "Teaches recursive division base case reduction.",
            "learningObjective": "Master the algorithmic pattern of Recursion using Power of Two.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Recursion pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Recursion core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Recursion pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Climbing Stairs",
            "slug": "climbing-stairs",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/climbing-stairs/",
            "order": 3,
            "whyThisProblem": "Connects recursive step calculations to dynamic decision trees.",
            "learningObjective": "Master the algorithmic pattern of Recursion using Climbing Stairs.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Recursion pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Recursion core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Recursion pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-13",
    "title": "STAGE 13 — TREES",
    "topics": [
      {
        "id": "binary-tree-basics",
        "title": "Binary Tree Basics",
        "explanation": "A Binary Tree is a hierarchical non-linear data structure where each node has at most two children (left and right).",
        "whyItMatters": "Trees naturally represent hierarchical relationships (file systems, HTML DOM) and enable fast searching.",
        "connection": "Recursion showed how functions call themselves. Binary Tree Basics applies recursion directly to process left and right child nodes.",
        "whenToUse": "Use for hierarchical data, recursive evaluations, and decision trees.",
        "recognitionClues": "Max depth of binary tree, check identical trees, invert binary tree, tree traversals.",
        "coreIdea": "Recursively process left and right child subtrees and aggregate tree metrics (e.g. 1 + max(left, right)).",
        "codeTemplates": {
          "python": "def max_depth(root):\n    if not root:\n        return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))",
          "java": "public int maxDepth(TreeNode root) {\n    if (root == null) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}",
          "cpp": "int maxDepth(TreeNode* root) {\n    if (!root) return 0;\n    return 1 + max(maxDepth(root->left), maxDepth(root->right));\n}",
          "c": "int maxDepth(struct TreeNode* root) {\n    if (!root) return 0;\n    int l = maxDepth(root->left);\n    int r = maxDepth(root->right);\n    return 1 + (l > r ? l : r);\n}"
        },
        "commonMistakes": [
          "Not checking if root or node is null before accessing node.left or node.right.",
          "Confusing tree height (edges) with depth (nodes).",
          "Not returning values from recursive calls."
        ],
        "problems": [
          {
            "title": "Maximum Depth of Binary Tree",
            "slug": "maximum-depth-of-binary-tree",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
            "order": 1,
            "whyThisProblem": "The fundamental recursive depth aggregation pattern.",
            "learningObjective": "Master the algorithmic pattern of Binary Tree Basics using Maximum Depth of Binary Tree.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Binary Tree Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Binary Tree Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Binary Tree Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Same Tree",
            "slug": "same-tree",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/same-tree/",
            "order": 2,
            "whyThisProblem": "Teaches simultaneous recursive traversal of two tree structures.",
            "learningObjective": "Master the algorithmic pattern of Binary Tree Basics using Same Tree.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Binary Tree Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Binary Tree Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Binary Tree Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Invert Binary Tree",
            "slug": "invert-binary-tree",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/invert-binary-tree/",
            "order": 3,
            "whyThisProblem": "Swaps left and right pointers at each subtree node.",
            "learningObjective": "Master the algorithmic pattern of Binary Tree Basics using Invert Binary Tree.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Binary Tree Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Binary Tree Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Binary Tree Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Binary Tree Preorder Traversal",
            "slug": "binary-tree-preorder-traversal",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
            "order": 4,
            "whyThisProblem": "Demonstrates Root -> Left -> Right order traversal.",
            "learningObjective": "Master the algorithmic pattern of Binary Tree Basics using Binary Tree Preorder Traversal.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Binary Tree Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Binary Tree Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Binary Tree Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      },
      {
        "id": "tree-dfs-bfs",
        "title": "Tree DFS / BFS",
        "explanation": "Tree Depth-First Search (DFS) explores subtrees deeply using recursion/stack; Breadth-First Search (BFS) explores trees level-by-level using a Queue.",
        "whyItMatters": "BFS finds shortest paths / minimum depth in trees; DFS evaluates path conditions and tree properties.",
        "connection": "Binary Tree Basics focused on simple DFS. Tree DFS/BFS teaches systematic level-order queue processing and structural path calculations.",
        "whenToUse": "Use BFS for level-by-level processing; use DFS for path properties and subtree aggregation.",
        "recognitionClues": "Binary tree level order traversal, diameter of binary tree, balanced tree, path sum.",
        "coreIdea": "BFS: Use a Queue, process nodes level by level using queue size loop. DFS: Recursively compute subtree metrics.",
        "codeTemplates": {
          "python": "def level_order(root):\n    if not root: return []\n    res, q = [], deque([root])\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        res.append(level)\n    return res",
          "java": "public List<List<Integer>> levelOrder(TreeNode root) {\n    List<List<Integer>> res = new ArrayList<>();\n    if (root == null) return res;\n    Queue<TreeNode> q = new LinkedList<>();\n    q.add(root);\n    while (!q.isEmpty()) {\n        int size = q.size();\n        List<Integer> level = new ArrayList<>();\n        for (int i = 0; i < size; i++) {\n            TreeNode node = q.poll();\n            level.add(node.val);\n            if (node.left != null) q.add(node.left);\n            if (node.right != null) q.add(node.right);\n        }\n        res.add(level);\n    }\n    return res;\n}",
          "cpp": "vector<vector<int>> levelOrder(TreeNode* root) {\n    vector<vector<int>> res;\n    if (!root) return res;\n    queue<TreeNode*> q;\n    q.push(root);\n    while (!q.empty()) {\n        int sz = q.size();\n        vector<int> level;\n        for (int i = 0; i < sz; i++) {\n            TreeNode* node = q.front(); q.pop();\n            level.push_back(node->val);\n            if (node->left) q.push(node->left);\n            if (node->right) q.push(node->right);\n        }\n        res.push_back(level);\n    }\n    return res;\n}",
          "c": "// Level order BFS in C using queue array"
        },
        "commonMistakes": [
          "Not snapshots queue size before level loop in BFS.",
          "Confusing preorder/inorder/postorder traversal order.",
          "Not returning global maximum vs subtree height in diameter calculation."
        ],
        "problems": [
          {
            "title": "Binary Tree Level Order Traversal",
            "slug": "binary-tree-level-order-traversal",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
            "order": 1,
            "whyThisProblem": "The essential level-by-level BFS queue traversal implementation.",
            "learningObjective": "Master the algorithmic pattern of Tree DFS / BFS using Binary Tree Level Order Traversal.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Tree DFS / BFS pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Tree DFS / BFS core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Tree DFS / BFS pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Diameter of Binary Tree",
            "slug": "diameter-of-binary-tree",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/diameter-of-binary-tree/",
            "order": 2,
            "whyThisProblem": "Calculates longest path between any two nodes using recursive height.",
            "learningObjective": "Master the algorithmic pattern of Tree DFS / BFS using Diameter of Binary Tree.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Tree DFS / BFS pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Tree DFS / BFS core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Tree DFS / BFS pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Balanced Binary Tree",
            "slug": "balanced-binary-tree",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/balanced-binary-tree/",
            "order": 3,
            "whyThisProblem": "Checks subtree height differential constraints.",
            "learningObjective": "Master the algorithmic pattern of Tree DFS / BFS using Balanced Binary Tree.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Tree DFS / BFS pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Tree DFS / BFS core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Tree DFS / BFS pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Path Sum",
            "slug": "path-sum",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/path-sum/",
            "order": 4,
            "whyThisProblem": "Root-to-leaf path target sum matching using DFS.",
            "learningObjective": "Master the algorithmic pattern of Tree DFS / BFS using Path Sum.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Tree DFS / BFS pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Tree DFS / BFS core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Tree DFS / BFS pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      },
      {
        "id": "binary-search-tree",
        "title": "Binary Search Tree",
        "explanation": "A Binary Search Tree (BST) is a binary tree where for every node: all left subtree values are strictly smaller, and all right subtree values are strictly larger.",
        "whyItMatters": "Enables search, insertion, and deletion operations in O(log N) average time.",
        "connection": "Binary Search worked on sorted arrays. Binary Search Tree brings binary search speed to dynamic linked tree structures.",
        "whenToUse": "Use BST when maintaining dynamically ordered data with fast lookup, insertion, and ancestor search.",
        "recognitionClues": "Search in BST, validate BST, lowest common ancestor in BST, inorder traversal gives sorted list.",
        "coreIdea": "Exploit ordering property: if target < node.val recurse left; if target > node.val recurse right.",
        "codeTemplates": {
          "python": "def search_bst(root, val):\n    if not root or root.val == val:\n        return root\n    if val < root.val:\n        return search_bst(root.left, val)\n    return search_bst(root.right, val)",
          "java": "public TreeNode searchBST(TreeNode root, int val) {\n    if (root == null || root.val == val) return root;\n    if (val < root.val) return searchBST(root.left, val);\n    return searchBST(root.right, val);\n}",
          "cpp": "TreeNode* searchBST(TreeNode* root, int val) {\n    if (!root || root->val == val) return root;\n    if (val < root->val) return searchBST(root->left, val);\n    return searchBST(root->right, val);\n}",
          "c": "struct TreeNode* searchBST(struct TreeNode* root, int val) {\n    if (!root || root->val == val) return root;\n    if (val < root->val) return searchBST(root->left, val);\n    return searchBST(root->right, val);\n}"
        },
        "commonMistakes": [
          "Validating BST by only checking immediate children instead of enforcing global min/max bounds for the subtree.",
          "Not using the BST property in LCA problems (doing full tree search instead of O(log N) directional search)."
        ],
        "problems": [
          {
            "title": "Search in a Binary Search Tree",
            "slug": "search-in-a-binary-search-tree",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/search-in-a-binary-search-tree/",
            "order": 1,
            "whyThisProblem": "Direct directional lookup exploiting BST ordering.",
            "learningObjective": "Master the algorithmic pattern of Binary Search Tree using Search in a Binary Search Tree.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Binary Search Tree pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Binary Search Tree core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Binary Search Tree pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Validate Binary Search Tree",
            "slug": "validate-binary-search-tree",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/validate-binary-search-tree/",
            "order": 2,
            "whyThisProblem": "Teaches passing valid min/max value boundaries down subtrees.",
            "learningObjective": "Master the algorithmic pattern of Binary Search Tree using Validate Binary Search Tree.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Binary Search Tree pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Binary Search Tree core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Binary Search Tree pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(log n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Lowest Common Ancestor of a Binary Search Tree",
            "slug": "lowest-common-ancestor-of-a-binary-search-tree",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
            "order": 3,
            "whyThisProblem": "Finds split point of two values in BST ordering.",
            "learningObjective": "Master the algorithmic pattern of Binary Search Tree using Lowest Common Ancestor of a Binary Search Tree.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Binary Search Tree pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Binary Search Tree core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Binary Search Tree pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(log n)",
            "spaceComplexity": "O(n)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-14",
    "title": "STAGE 14 — HEAP / PRIORITY QUEUE",
    "topics": [
      {
        "id": "heap-basics",
        "title": "Heap Basics",
        "explanation": "A Heap (Priority Queue) is a tree-based data structure that efficiently retrieves the minimum (Min-Heap) or maximum (Max-Heap) element in O(1) time and inserts/removes in O(log N) time.",
        "whyItMatters": "Finding top K elements takes O(N log K) using a Heap of size K, compared to O(N log N) full array sorting.",
        "connection": "BST allowed dynamic sorting. Heap / Priority Queue provides a lightweight structure focused strictly on fast top/min/max access.",
        "whenToUse": "Use Priority Queue whenever you need to dynamically track Top K elements or continuously extract min/max items.",
        "recognitionClues": "Kth largest element, top K frequent items, K closest points to origin, median stream.",
        "coreIdea": "Maintain a Min-Heap of size K. When heap size exceeds K, pop the smallest element. The remaining elements are the K largest.",
        "codeTemplates": {
          "python": "import heapq\n\ndef find_kth_largest(nums, k):\n    min_heap = []\n    for num in nums:\n        heapq.heappush(min_heap, num)\n        if len(min_heap) > k:\n            heapq.heappop(min_heap)\n    return min_heap[0]",
          "java": "public int findKthLargest(int[] nums, int k) {\n    PriorityQueue<Integer> minHeap = new PriorityQueue<>();\n    for (int num : nums) {\n        minHeap.add(num);\n        if (minHeap.size() > k) {\n            minHeap.poll();\n        }\n    }\n    return minHeap.peek();\n}",
          "cpp": "int findKthLargest(vector<int>& nums, int k) {\n    priority_queue<int, vector<int>, greater<int>> minHeap;\n    for (int num : nums) {\n        minHeap.push(num);\n        if (minHeap.size() > k) {\n            minHeap.pop();\n        }\n    }\n    return minHeap.top();\n}",
          "c": "// Heap implementation using array heapify up and down functions"
        },
        "commonMistakes": [
          "Using Max-Heap instead of Min-Heap when finding K largest elements (causing O(N log N) space/time instead of O(N log K)).",
          "Not custom comparator implementation when sorting complex objects or pairs in priority queues."
        ],
        "problems": [
          {
            "title": "Kth Largest Element in an Array",
            "slug": "kth-largest-element-in-an-array",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
            "order": 1,
            "whyThisProblem": "The classic Top K problem solved with a size-K Min-Heap.",
            "learningObjective": "Master the algorithmic pattern of Heap Basics using Kth Largest Element in an Array.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Heap Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Heap Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Heap Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Last Stone Weight",
            "slug": "last-stone-weight",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/last-stone-weight/",
            "order": 2,
            "whyThisProblem": "Simulates stone smashing by repeatedly extracting the 2 largest items from a Max-Heap.",
            "learningObjective": "Master the algorithmic pattern of Heap Basics using Last Stone Weight.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Heap Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Heap Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Heap Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Top K Frequent Elements",
            "slug": "top-k-frequent-elements",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/top-k-frequent-elements/",
            "order": 3,
            "whyThisProblem": "Combines HashMap frequency counting with Priority Queue ordering.",
            "learningObjective": "Master the algorithmic pattern of Heap Basics using Top K Frequent Elements.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Heap Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Heap Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Heap Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "K Closest Points to Origin",
            "slug": "k-closest-points-to-origin",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/k-closest-points-to-origin/",
            "order": 4,
            "whyThisProblem": "Custom distance comparator Priority Queue implementation.",
            "learningObjective": "Master the algorithmic pattern of Heap Basics using K Closest Points to Origin.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Heap Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Heap Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Heap Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-15",
    "title": "STAGE 15 — GRAPHS",
    "topics": [
      {
        "id": "graph-basics",
        "title": "Graph Basics",
        "explanation": "A Graph consists of vertices (nodes) connected by edges. Graphs can be directed/undirected and are typically represented using Adjacency Lists.",
        "whyItMatters": "Models complex real-world networks (social connections, computer networks, road maps, web links).",
        "connection": "Trees were hierarchical graphs without cycles. Graph Basics introduces general graphs with cycles, requiring visited tracking.",
        "whenToUse": "Use when modeling relationships between entities or network connections.",
        "recognitionClues": "Center of star graph, path exists in graph, connected components, provinces count.",
        "coreIdea": "Build Adjacency List: Map<Node, List<Neighbors>>. Use a Visited set to prevent infinite loops during traversal.",
        "codeTemplates": {
          "python": "def valid_path(n, edges, source, destination):\n    graph = {i: [] for i in range(n)}\n    for u, v in edges:\n        graph[u].append(v)\n        graph[v].append(u)\n    \n    visited = set()\n    def dfs(node):\n        if node == destination: return True\n        visited.add(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                if dfs(neighbor): return True\n        return False\n    return dfs(source)",
          "java": "public boolean validPath(int n, int[][] edges, int source, int destination) {\n    List<List<Integer>> graph = new ArrayList<>();\n    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());\n    for (int[] edge : edges) {\n        graph.get(edge[0]).add(edge[1]);\n        graph.get(edge[1]).add(edge[0]);\n    }\n    boolean[] visited = new boolean[n];\n    return dfs(graph, visited, source, destination);\n}",
          "cpp": "bool validPath(int n, vector<vector<int>>& edges, int source, int destination) {\n    vector<vector<int>> graph(n);\n    for (auto& edge : edges) {\n        graph[edge[0]].push_back(edge[1]);\n        graph[edge[1]].push_back(edge[0]);\n    }\n    vector<bool> visited(n, false);\n    // Execute DFS or BFS\n    return true;\n}",
          "c": "// Adjacency list representation using array of linked lists"
        },
        "commonMistakes": [
          "Forgetting to track visited nodes, causing infinite recursion loops on graphs with cycles.",
          "Not handling disconnected graph components.",
          "Building matrix representations (O(V^2)) when sparse adjacency lists (O(V + E)) are required."
        ],
        "problems": [
          {
            "title": "Find Center of Star Graph",
            "slug": "find-center-of-star-graph",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/find-center-of-star-graph/",
            "order": 1,
            "whyThisProblem": "Simple node degree inspection in star graph representations.",
            "learningObjective": "Master the algorithmic pattern of Graph Basics using Find Center of Star Graph.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Graph Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Graph Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Graph Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Find if Path Exists in Graph",
            "slug": "find-if-path-exists-in-graph",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/find-if-path-exists-in-graph/",
            "order": 2,
            "whyThisProblem": "Basic DFS traversal checking connectivity between source and destination.",
            "learningObjective": "Master the algorithmic pattern of Graph Basics using Find if Path Exists in Graph.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Graph Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Graph Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Graph Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Number of Provinces",
            "slug": "number-of-provinces",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/number-of-provinces/",
            "order": 3,
            "whyThisProblem": "Counts total connected components in undirected graphs.",
            "learningObjective": "Master the algorithmic pattern of Graph Basics using Number of Provinces.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Graph Basics pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Graph Basics core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Graph Basics pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      },
      {
        "id": "graph-dfs-bfs",
        "title": "Graph DFS / BFS",
        "explanation": "Depth-First Search (DFS) explores as deep as possible before backtracking; Breadth-First Search (BFS) explores neighbor nodes layer-by-layer in expanding waves.",
        "whyItMatters": "Primary algorithms for grid matrix exploration, island counting, and flood fills.",
        "connection": "Graph Basics introduced adjacency lists. Graph DFS/BFS applies search techniques to 2D grid matrices and connected structures.",
        "whenToUse": "Use DFS/BFS for grid traversal, island counting, rotting infection spreads, and graph cloning.",
        "recognitionClues": "Flood fill, number of islands, clone graph, rotting oranges, 2D matrix exploration.",
        "coreIdea": "Iterate 2D grid cells. When finding unvisited land/target, trigger DFS/BFS to mark all 4-directionally connected neighbors as visited.",
        "codeTemplates": {
          "python": "def num_islands(grid):\n    if not grid: return 0\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    \n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':\n            return\n        grid[r][c] = '0' # mark visited\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count",
          "java": "public int numIslands(char[][] grid) {\n    if (grid == null || grid.length == 0) return 0;\n    int rows = grid.length, cols = grid[0].length, count = 0;\n    for (int r = 0; r < rows; r++) {\n        for (int c = 0; c < cols; c++) {\n            if (grid[r][c] == '1') {\n                count++;\n                dfs(grid, r, c);\n            }\n        }\n    }\n    return count;\n}",
          "cpp": "int numIslands(vector<vector<char>>& grid) {\n    if (grid.empty()) return 0;\n    int rows = grid.size(), cols = grid[0].size(), count = 0;\n    for (int r = 0; r < rows; r++) {\n        for (int c = 0; c < cols; c++) {\n            if (grid[r][c] == '1') {\n                count++;\n                // Trigger DFS helper\n            }\n        }\n    }\n    return count;\n}",
          "c": "// 2D grid recursive DFS for island counting"
        },
        "commonMistakes": [
          "Not checking grid bounds (r < 0 || r >= rows || c < 0 || c >= cols) before accessing cells.",
          "Forgetting to mark cells as visited, causing stack overflow.",
          "Not handling diagonal vs 4-directional neighbor checks appropriately."
        ],
        "problems": [
          {
            "title": "Flood Fill",
            "slug": "flood-fill",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/flood-fill/",
            "order": 1,
            "whyThisProblem": "Introductory 2D grid cell color replacement DFS.",
            "learningObjective": "Master the algorithmic pattern of Graph DFS / BFS using Flood Fill.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Graph DFS / BFS pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Graph DFS / BFS core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Graph DFS / BFS pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Number of Islands",
            "slug": "number-of-islands",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/number-of-islands/",
            "order": 2,
            "whyThisProblem": "The iconic connected component grid traversal problem.",
            "learningObjective": "Master the algorithmic pattern of Graph DFS / BFS using Number of Islands.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Graph DFS / BFS pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Graph DFS / BFS core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Graph DFS / BFS pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Clone Graph",
            "slug": "clone-graph",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/clone-graph/",
            "order": 3,
            "whyThisProblem": "Uses DFS/BFS with HashMap node mapping to deep copy graphs.",
            "learningObjective": "Master the algorithmic pattern of Graph DFS / BFS using Clone Graph.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Graph DFS / BFS pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Graph DFS / BFS core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Graph DFS / BFS pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Rotting Oranges",
            "slug": "rotting-oranges",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/rotting-oranges/",
            "order": 4,
            "whyThisProblem": "Multi-source BFS grid simulation.",
            "learningObjective": "Master the algorithmic pattern of Graph DFS / BFS using Rotting Oranges.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Graph DFS / BFS pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Graph DFS / BFS core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Graph DFS / BFS pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      },
      {
        "id": "graph-shortest-path",
        "title": "Graph Shortest Path",
        "explanation": "Graph Shortest Path finds the minimum distance or steps required to travel between nodes using BFS (unweighted) or Dijkstra (weighted).",
        "whyItMatters": "Calculates minimum travel steps, network delay times, and optimal routing.",
        "connection": "Graph DFS/BFS introduced general traversal. Graph Shortest Path focuses specifically on level-order distance minimization.",
        "whenToUse": "Use Queue BFS for unweighted unit-step grids; use Dijkstra Priority Queue for weighted edge graphs.",
        "recognitionClues": "Shortest path in binary matrix, minimum steps to reach target, network delay time.",
        "coreIdea": "Queue BFS expands outward in distance levels (dist = 0, 1, 2...). The first time target is reached, return current distance.",
        "codeTemplates": {
          "python": "def shortest_path_binary_matrix(grid):\n    n = len(grid)\n    if grid[0][0] != 0 or grid[n-1][n-1] != 0: return -1\n    q = deque([(0, 0, 1)])\n    grid[0][0] = 1\n    directions = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]\n    while q:\n        r, c, d = q.popleft()\n        if r == n - 1 and c == n - 1: return d\n        for dr, dc in directions:\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:\n                grid[nr][nc] = 1\n                q.append((nr, nc, d + 1))\n    return -1",
          "java": "public int shortestPathBinaryMatrix(int[][] grid) {\n    int n = grid.length;\n    if (grid[0][0] != 0 || grid[n-1][n-1] != 0) return -1;\n    Queue<int[]> q = new LinkedList<>();\n    q.add(new int[]{0, 0, 1});\n    grid[0][0] = 1;\n    int[][] dirs = {{-1,-1},{-1,0},{-1,1},{0,-1},{0,1},{1,-1},{1,0},{1,1}};\n    while (!q.isEmpty()) {\n        int[] curr = q.poll();\n        int r = curr[0], c = curr[1], d = curr[2];\n        if (r == n - 1 && c == n - 1) return d;\n        for (int[] dir : dirs) {\n            int nr = r + dir[0], nc = c + dir[1];\n            if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 0) {\n                grid[nr][nc] = 1;\n                q.add(new int[]{nr, nc, d + 1});\n            }\n        }\n    }\n    return -1;\n}",
          "cpp": "int shortestPathBinaryMatrix(vector<vector<int>>& grid) {\n    int n = grid.size();\n    if (grid[0][0] != 0 || grid[n-1][n-1] != 0) return -1;\n    queue<vector<int>> q;\n    q.push({0, 0, 1});\n    grid[0][0] = 1;\n    // Execute 8-directional BFS\n    return -1;\n}",
          "c": "// Grid BFS queue distance matrix calculation"
        },
        "commonMistakes": [
          "Using DFS instead of BFS for unweighted shortest path (DFS visits long paths first).",
          "Not marking grid cells as visited when pushing to queue, causing redundant queue insertions."
        ],
        "problems": [
          {
            "title": "Shortest Path in Binary Matrix",
            "slug": "shortest-path-in-binary-matrix",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
            "order": 1,
            "whyThisProblem": "Unweighted 8-directional BFS shortest path grid search.",
            "learningObjective": "Master the algorithmic pattern of Graph Shortest Path using Shortest Path in Binary Matrix.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Graph Shortest Path pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Graph Shortest Path core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Graph Shortest Path pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Network Delay Time",
            "slug": "network-delay-time",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/network-delay-time/",
            "order": 2,
            "whyThisProblem": "Weighted graph shortest path using Dijkstra algorithm.",
            "learningObjective": "Master the algorithmic pattern of Graph Shortest Path using Network Delay Time.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Graph Shortest Path pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Graph Shortest Path core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Graph Shortest Path pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-16",
    "title": "STAGE 16 — BACKTRACKING",
    "topics": [
      {
        "id": "backtracking",
        "title": "Backtracking",
        "explanation": "Backtracking explores decision space by making choices recursively and undoing choices (Choose -> Explore -> Undo) when dead ends occur.",
        "whyItMatters": "Generates all combinations, permutations, subsets, and solves constraint satisfaction problems (Sudoku, N-Queens).",
        "connection": "Graph DFS explored existing fixed paths. Backtracking dynamically builds and tears down candidate decision trees.",
        "whenToUse": "Use when asked to generate \"all possible\" combinations, subsets, permutations, or valid board configurations.",
        "recognitionClues": "Subsets, permutations, combination sum, letter combinations of phone number.",
        "coreIdea": "Choose candidate -> Recurse to explore deeper -> Undo choice (pop candidate) to restore previous state for next iterations.",
        "codeTemplates": {
          "python": "def subsets(nums):\n    res = []\n    def backtrack(start, path):\n        res.append(list(path))\n        for i in range(start, len(nums)):\n            path.append(nums[i])   # CHOOSE\n            backtrack(i + 1, path) # EXPLORE\n            path.pop()             # UNDO\n    backtrack(0, [])\n    return res",
          "java": "public List<List<Integer>> subsets(int[] nums) {\n    List<List<Integer>> res = new ArrayList<>();\n    backtrack(res, new ArrayList<>(), nums, 0);\n    return res;\n}\nprivate void backtrack(List<List<Integer>> res, List<Integer> path, int[] nums, int start) {\n    res.add(new ArrayList<>(path));\n    for (int i = start; i < nums.length; i++) {\n        path.add(nums[i]);            // CHOOSE\n        backtrack(res, path, nums, i + 1); // EXPLORE\n        path.remove(path.size() - 1); // UNDO\n    }\n}",
          "cpp": "vector<vector<int>> subsets(vector<int>& nums) {\n    vector<vector<int>> res;\n    vector<int> path;\n    function<void(int)> backtrack = [&](int start) {\n        res.push_back(path);\n        for (int i = start; i < nums.size(); i++) {\n            path.push_back(nums[i]);   // CHOOSE\n            backtrack(i + 1);          // EXPLORE\n            path.pop_back();           // UNDO\n        }\n    };\n    backtrack(0);\n    return res;\n}",
          "c": "// Backtracking template using dynamic array path buffers"
        },
        "commonMistakes": [
          "Forgetting to add a copy of the path/solution list (adding reference instead of shallow/deep copy).",
          "Forgetting to pop/undo choices after recursive returns.",
          "Incorrect loop start index causing duplicate subset/permutation generation."
        ],
        "problems": [
          {
            "title": "Subsets",
            "slug": "subsets",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/subsets/",
            "order": 1,
            "whyThisProblem": "The foundational power-set backtracking pattern.",
            "learningObjective": "Master the algorithmic pattern of Backtracking using Subsets.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Backtracking pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Backtracking core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Backtracking pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Permutations",
            "slug": "permutations",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/permutations/",
            "order": 2,
            "whyThisProblem": "Teaches order-dependent element selection using visited boolean arrays.",
            "learningObjective": "Master the algorithmic pattern of Backtracking using Permutations.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Backtracking pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Backtracking core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Backtracking pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Combination Sum",
            "slug": "combination-sum",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/combination-sum/",
            "order": 3,
            "whyThisProblem": "Backtracking with target reduction allowing element reuse.",
            "learningObjective": "Master the algorithmic pattern of Backtracking using Combination Sum.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Backtracking pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Backtracking core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Backtracking pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Letter Combinations of a Phone Number",
            "slug": "letter-combinations-of-a-phone-number",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
            "order": 4,
            "whyThisProblem": "Applies backtracking to digit-to-char mapping sequences.",
            "learningObjective": "Master the algorithmic pattern of Backtracking using Letter Combinations of a Phone Number.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Backtracking pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Backtracking core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Backtracking pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-17",
    "title": "STAGE 17 — DYNAMIC PROGRAMMING",
    "topics": [
      {
        "id": "dp-1d",
        "title": "1D Dynamic Programming",
        "explanation": "Dynamic Programming (DP) solves complex optimization problems by breaking them into overlapping subproblems, storing subproblem solutions (memoization / tabular DP) to avoid recalculation.",
        "whyItMatters": "Converts exponential O(2^N) recursive algorithms into linear O(N) polynomial time.",
        "connection": "Backtracking explored all paths sequentially (exponential time). 1D DP remembers subproblem results so each subproblem is solved exactly once.",
        "whenToUse": "Use when a problem has overlapping subproblems and optimal substructure (e.g. min cost, ways to reach target).",
        "recognitionClues": "Climbing stairs, min cost climbing, house robber (non-adjacent choices), Fibonacci sequence.",
        "coreIdea": "Define state dp[i]. Establish base cases (dp[0], dp[1]). Compute state using recurrence: dp[i] = fn(dp[i-1], dp[i-2]).",
        "codeTemplates": {
          "python": "def rob(nums):\n    if not nums: return 0\n    if len(nums) == 1: return nums[0]\n    dp = [0] * len(nums)\n    dp[0] = nums[0]\n    dp[1] = max(nums[0], nums[1])\n    for i in range(2, len(nums)):\n        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])\n    return dp[-1]",
          "java": "public int rob(int[] nums) {\n    if (nums == null || nums.length == 0) return 0;\n    if (nums.length == 1) return nums[0];\n    int[] dp = new int[nums.length];\n    dp[0] = nums[0];\n    dp[1] = Math.max(nums[0], nums[1]);\n    for (int i = 2; i < nums.length; i++) {\n        dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);\n    }\n    return dp[nums.length - 1];\n}",
          "cpp": "int rob(vector<int>& nums) {\n    if (nums.empty()) return 0;\n    if (nums.size() == 1) return nums[0];\n    vector<int> dp(nums.size());\n    dp[0] = nums[0];\n    dp[1] = max(nums[0], nums[1]);\n    for (int i = 2; i < nums.size(); i++) {\n        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i]);\n    }\n    return dp.back();\n}",
          "c": "int rob(int* nums, int numsSize) {\n    if (numsSize == 0) return 0;\n    if (numsSize == 1) return nums[0];\n    int prev2 = nums[0];\n    int prev1 = nums[0] > nums[1] ? nums[0] : nums[1];\n    for (int i = 2; i < numsSize; i++) {\n        int curr = prev1 > (prev2 + nums[i]) ? prev1 : (prev2 + nums[i]);\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return prev1;\n}"
        },
        "commonMistakes": [
          "Not defining base cases properly.",
          "Incorrect state transition equation.",
          "Not realizing space can be optimized from O(N) array to O(1) two variables."
        ],
        "problems": [
          {
            "title": "Climbing Stairs",
            "slug": "climbing-stairs",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/climbing-stairs/",
            "order": 1,
            "whyThisProblem": "The introductory 1D DP recurrence relation (dp[i] = dp[i-1] + dp[i-2]).",
            "learningObjective": "Master the algorithmic pattern of 1D Dynamic Programming using Climbing Stairs.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the 1D Dynamic Programming pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the 1D Dynamic Programming core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the 1D Dynamic Programming pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Min Cost Climbing Stairs",
            "slug": "min-cost-climbing-stairs",
            "difficulty": "EASY",
            "leetcodeUrl": "https://leetcode.com/problems/min-cost-climbing-stairs/",
            "order": 2,
            "whyThisProblem": "1D DP optimization state transition (min cost choice).",
            "learningObjective": "Master the algorithmic pattern of 1D Dynamic Programming using Min Cost Climbing Stairs.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the 1D Dynamic Programming pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the 1D Dynamic Programming core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the 1D Dynamic Programming pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "House Robber",
            "slug": "house-robber",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/house-robber/",
            "order": 3,
            "whyThisProblem": "Non-adjacent element selection DP choice optimization.",
            "learningObjective": "Master the algorithmic pattern of 1D Dynamic Programming using House Robber.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the 1D Dynamic Programming pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the 1D Dynamic Programming core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the 1D Dynamic Programming pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "House Robber II",
            "slug": "house-robber-ii",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/house-robber-ii/",
            "order": 4,
            "whyThisProblem": "Handles circular array DP boundary cases by splitting into two 1D DP passes.",
            "learningObjective": "Master the algorithmic pattern of 1D Dynamic Programming using House Robber II.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the 1D Dynamic Programming pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the 1D Dynamic Programming core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the 1D Dynamic Programming pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      },
      {
        "id": "dp-2d",
        "title": "2D Dynamic Programming",
        "explanation": "2D Dynamic Programming uses a two-dimensional grid/table dp[i][j] to represent subproblems involving 2D grid paths, string sequence comparisons, or knapsack choices.",
        "whyItMatters": "Solves complex grid navigation, string alignment (LCS, Edit Distance), and subset decision problems.",
        "connection": "1D DP tracked single sequence state transitions. 2D DP expands this to two dimensions (e.g. string i vs string j, or grid row r vs col c).",
        "whenToUse": "Use for 2D grid paths, string matching, longest common subsequences, and coin change target choices.",
        "recognitionClues": "Unique paths in grid, longest common subsequence, coin change, word break.",
        "coreIdea": "Define state dp[i][j]. Initialize row 0 and col 0 base cases. Compute dp[i][j] from top dp[i-1][j] and left dp[i][j-1] subproblem states.",
        "codeTemplates": {
          "python": "def unique_paths(m, n):\n    dp = [[1] * n for _ in range(m)]\n    for r in range(1, m):\n        for c in range(1, n):\n            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]\n    return dp[m - 1][n - 1]",
          "java": "public int uniquePaths(int m, int n) {\n    int[][] dp = new int[m][n];\n    for (int i = 0; i < m; i++) dp[i][0] = 1;\n    for (int j = 0; j < n; j++) dp[0][j] = 1;\n    for (int r = 1; r < m; r++) {\n        for (int c = 1; c < n; c++) {\n            dp[r][c] = dp[r - 1][c] + dp[r][c - 1];\n        }\n    }\n    return dp[m - 1][n - 1];\n}",
          "cpp": "int uniquePaths(int m, int n) {\n    vector<vector<int>> dp(m, vector<int>(n, 1));\n    for (int r = 1; r < m; r++) {\n        for (int c = 1; c < n; c++) {\n            dp[r][c] = dp[r - 1][c] + dp[r][c - 1];\n        }\n    }\n    return dp[m - 1][n - 1];\n}",
          "c": "int uniquePaths(int m, int n) {\n    int dp[101][101];\n    for (int i = 0; i < m; i++) dp[i][0] = 1;\n    for (int j = 0; j < n; j++) dp[0][j] = 1;\n    for (int r = 1; r < m; r++) {\n        for (int c = 1; c < n; c++) {\n            dp[r][c] = dp[r - 1][c] + dp[r][c - 1];\n        }\n    }\n    return dp[m - 1][n - 1];\n}"
        },
        "commonMistakes": [
          "Off-by-one errors in table dimensions (e.g. allocating m vs m + 1).",
          "Incorrect base case initialization for row 0 and col 0.",
          "Reversing loop iteration directions in bottom-up table filling."
        ],
        "problems": [
          {
            "title": "Unique Paths",
            "slug": "unique-paths",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/unique-paths/",
            "order": 1,
            "whyThisProblem": "The essential 2D grid path counting DP state transition.",
            "learningObjective": "Master the algorithmic pattern of 2D Dynamic Programming using Unique Paths.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the 2D Dynamic Programming pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the 2D Dynamic Programming core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the 2D Dynamic Programming pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Longest Common Subsequence",
            "slug": "longest-common-subsequence",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/longest-common-subsequence/",
            "order": 2,
            "whyThisProblem": "The classic 2D string matching alignment DP problem.",
            "learningObjective": "Master the algorithmic pattern of 2D Dynamic Programming using Longest Common Subsequence.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the 2D Dynamic Programming pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the 2D Dynamic Programming core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the 2D Dynamic Programming pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Coin Change",
            "slug": "coin-change",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/coin-change/",
            "order": 3,
            "whyThisProblem": "Unbounded knapsack minimum coin count DP optimization.",
            "learningObjective": "Master the algorithmic pattern of 2D Dynamic Programming using Coin Change.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the 2D Dynamic Programming pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the 2D Dynamic Programming core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the 2D Dynamic Programming pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          },
          {
            "title": "Word Break",
            "slug": "word-break",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/word-break/",
            "order": 4,
            "whyThisProblem": "String segmentation DP matching dictionary words.",
            "learningObjective": "Master the algorithmic pattern of 2D Dynamic Programming using Word Break.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the 2D Dynamic Programming pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the 2D Dynamic Programming core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the 2D Dynamic Programming pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)"
          }
        ]
      }
    ]
  },
  {
    "id": "stage-18",
    "title": "STAGE 18 — INTERVIEW PREPARATION",
    "topics": [
      {
        "id": "mixed-pattern-problems",
        "title": "Mixed Pattern Problems",
        "explanation": "Mixed Pattern Problems test your ability to recognize algorithmic patterns without explicit topic hints or context clues.",
        "whyItMatters": "In real technical interviews, nobody tells you \"Use Two Pointers\" or \"Use DP\". You must analyze constraints and pick the right pattern.",
        "connection": "You have learned all fundamental stages (Arrays -> Hash -> Pointers -> Window -> Stack -> Trees -> Graphs -> DP). Now test pattern synthesis under interview conditions.",
        "whenToUse": "Use during final interview prep to practice pattern identification.",
        "recognitionClues": "Synthesize constraints, evaluate space/time tradeoffs, select optimal patterns without hints.",
        "coreIdea": "1) Analyze constraints, 2) Identify bottleneck, 3) Select pattern, 4) Execute clean code.",
        "codeTemplates": {
          "python": "# Example: Product of Array Except Self without division\ndef product_except_self(nums):\n    n = len(nums)\n    res = [1] * n\n    prefix = 1\n    for i in range(n):\n        res[i] = prefix\n        prefix *= nums[i]\n    postfix = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= postfix\n        postfix *= nums[i]\n    return res",
          "java": "public int[] productExceptSelf(int[] nums) {\n    int n = nums.length;\n    int[] res = new int[n];\n    res[0] = 1;\n    for (int i = 1; i < n; i++) {\n        res[i] = res[i - 1] * nums[i - 1];\n    }\n    int right = 1;\n    for (int i = n - 1; i >= 0; i--) {\n        res[i] *= right;\n        right *= nums[i];\n    }\n    return res;\n}",
          "cpp": "vector<int> productExceptSelf(vector<int>& nums) {\n    int n = nums.size();\n    vector<int> res(n, 1);\n    for (int i = 1; i < n; i++) {\n        res[i] = res[i - 1] * nums[i - 1];\n    }\n    int right = 1;\n    for (int i = n - 1; i >= 0; i--) {\n        res[i] *= right;\n        right *= nums[i];\n    }\n    return res;\n}",
          "c": "int* productExceptSelf(int* nums, int numsSize, int* returnSize) {\n    int* res = (int*)malloc(numsSize * sizeof(int));\n    *returnSize = numsSize;\n    res[0] = 1;\n    for (int i = 1; i < numsSize; i++) res[i] = res[i - 1] * nums[i - 1];\n    int right = 1;\n    for (int i = numsSize - 1; i >= 0; i--) {\n        res[i] *= right;\n        right *= nums[i];\n    }\n    return res;\n}"
        },
        "commonMistakes": [
          "Jumping into code without checking input constraints.",
          "Missing edge cases like empty arrays or duplicate elements.",
          "Not considering space/time optimization tradeoffs."
        ],
        "problems": [
          {
            "title": "Product of Array Except Self",
            "slug": "product-of-array-except-self",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/product-of-array-except-self/",
            "order": 1,
            "whyThisProblem": "Prefix and postfix product array compilation without using division.",
            "learningObjective": "Master the algorithmic pattern of Mixed Pattern Problems using Product of Array Except Self.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Mixed Pattern Problems pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Mixed Pattern Problems core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Mixed Pattern Problems pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Trapping Rain Water",
            "slug": "trapping-rain-water",
            "difficulty": "HARD",
            "leetcodeUrl": "https://leetcode.com/problems/trapping-rain-water/",
            "order": 2,
            "whyThisProblem": "Classic hard problem solvable via Two Pointers, Monotonic Stack, or DP.",
            "learningObjective": "Master the algorithmic pattern of Mixed Pattern Problems using Trapping Rain Water.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Mixed Pattern Problems pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Mixed Pattern Problems core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Mixed Pattern Problems pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "LRU Cache",
            "slug": "lru-cache",
            "difficulty": "MEDIUM",
            "leetcodeUrl": "https://leetcode.com/problems/lru-cache/",
            "order": 3,
            "whyThisProblem": "Combines Doubly Linked List with HashMap for O(1) cache get/put operations.",
            "learningObjective": "Master the algorithmic pattern of Mixed Pattern Problems using LRU Cache.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Mixed Pattern Problems pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Mixed Pattern Problems core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Mixed Pattern Problems pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          },
          {
            "title": "Merge k Sorted Lists",
            "slug": "merge-k-sorted-lists",
            "difficulty": "HARD",
            "leetcodeUrl": "https://leetcode.com/problems/merge-k-sorted-lists/",
            "order": 4,
            "whyThisProblem": "Combines Linked Lists, Divide and Conquer, and Priority Queue.",
            "learningObjective": "Master the algorithmic pattern of Mixed Pattern Problems using Merge k Sorted Lists.",
            "thinkingQuestions": [
              "What information or state do I need to keep track of while processing elements?",
              "Can I optimize the lookup or traversal speed using the Mixed Pattern Problems pattern?",
              "What are the boundary conditions or edge cases (empty input, single element, negative numbers)?"
            ],
            "hints": [
              "Hint 1: Carefully examine the input constraints and what properties the elements hold.",
              "Hint 2: Apply the Mixed Pattern Problems core strategy to avoid unnecessary operations.",
              "Hint 3: Think about whether you can store previously computed states or process boundaries using pointers/maps."
            ],
            "approach": {
              "bruteForce": "Perform a naive scan checking every candidate pair or state sequentially.",
              "optimized": "Apply the Mixed Pattern Problems pattern to process data efficiently in linear or logarithmic time."
            },
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)"
          }
        ]
      }
    ]
  }
];
