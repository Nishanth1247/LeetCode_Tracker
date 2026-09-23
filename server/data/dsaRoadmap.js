/**
 * Structured DSA Roadmap Definition
 * 
 * Order is strictly preserved.
 * Every problem includes title, slug, difficulty, leetcodeUrl, topic, order.
 */

const dsaRoadmap = [
  {
    id: 'stage-0',
    title: 'STAGE 0 — PROGRAMMING THINKING',
    topics: [
      {
        id: 'programming-basics',
        title: 'Programming Basics',
        explanation: 'Understand core programming constructs: variables, conditional statements, loops, functions, basic input/output, and basic complexity ideas (O(1) vs O(N)).',
        recognitionClues: 'Understanding fundamental syntax and basic iteration before jumping into data structures.',
        basicIdea: 'Write clean loops, handle edge cases (empty input, zero), and analyze how many steps your loop runs.',
        problems: []
      }
    ]
  },
  {
    id: 'stage-1',
    title: 'STAGE 1 — ARRAYS',
    topics: [
      {
        id: 'array-traversal',
        title: 'Array Traversal',
        explanation: 'Learn how to iterate through arrays sequentially while maintaining running variables, counters, sums, or min/max values.',
        recognitionClues: 'Traverse contiguous memory, accumulate totals, find largest/smallest element in one pass.',
        basicIdea: 'Initialize a tracking variable before the loop, update it during iteration, and return the result.',
        problems: [
          {
            title: 'Running Sum of 1d Array',
            slug: 'running-sum-of-1d-array',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/running-sum-of-1d-array/',
            order: 1
          },
          {
            title: 'Richest Customer Wealth',
            slug: 'richest-customer-wealth',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/richest-customer-wealth/',
            order: 2
          },
          {
            title: 'Find Numbers with Even Number of Digits',
            slug: 'find-numbers-with-even-number-of-digits',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/find-numbers-with-even-number-of-digits/',
            order: 3
          },
          {
            title: 'Maximum Product Difference Between Two Pairs',
            slug: 'maximum-product-difference-between-two-pairs',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/maximum-product-difference-between-two-pairs/',
            order: 4
          }
        ]
      },
      {
        id: 'basic-array-manipulation',
        title: 'Basic Array Manipulation',
        explanation: 'Learn in-place array modifications, element removal, element shifting, and index tracking.',
        recognitionClues: 'Modify array in-place, remove duplicates, move zeroes to end, merge sorted arrays without extra space.',
        basicIdea: 'Use a writer pointer to overwrite values in-place while a reader pointer scans through the array.',
        problems: [
          {
            title: 'Remove Element',
            slug: 'remove-element',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/remove-element/',
            order: 1
          },
          {
            title: 'Remove Duplicates from Sorted Array',
            slug: 'remove-duplicates-from-sorted-array',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
            order: 2
          },
          {
            title: 'Move Zeroes',
            slug: 'move-zeroes',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/move-zeroes/',
            order: 3
          },
          {
            title: 'Merge Sorted Array',
            slug: 'merge-sorted-array',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/merge-sorted-array/',
            order: 4
          }
        ]
      }
    ]
  },
  {
    id: 'stage-2',
    title: 'STAGE 2 — STRINGS',
    topics: [
      {
        id: 'string-basics',
        title: 'String Basics',
        explanation: 'Understand string traversal, character comparison, building strings, and character frequency.',
        recognitionClues: 'Palindromes, prefixes, character manipulation, frequency checks, string reversals.',
        basicIdea: 'Treat strings as arrays of characters or use language string methods while being mindful of string immutability.',
        problems: [
          {
            title: 'Reverse String',
            slug: 'reverse-string',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/reverse-string/',
            order: 1
          },
          {
            title: 'Valid Palindrome',
            slug: 'valid-palindrome',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
            order: 2
          },
          {
            title: 'Longest Common Prefix',
            slug: 'longest-common-prefix',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/longest-common-prefix/',
            order: 3
          },
          {
            title: 'Valid Anagram',
            slug: 'valid-anagram',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/',
            order: 4
          }
        ]
      }
    ]
  },
  {
    id: 'stage-3',
    title: 'STAGE 3 — HASHING',
    topics: [
      {
        id: 'hashset',
        title: 'HashSet',
        explanation: 'Learn how to answer "Have I seen this element before?" in O(1) time using a HashSet.',
        recognitionClues: 'Check uniqueness, detect duplicate values, find intersections, cycle detection in sequences.',
        basicIdea: 'Store encountered items in a Set. Before adding a new item, check if it already exists in the Set.',
        problems: [
          {
            title: 'Contains Duplicate',
            slug: 'contains-duplicate',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/',
            order: 1
          },
          {
            title: 'Happy Number',
            slug: 'happy-number',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/happy-number/',
            order: 2
          },
          {
            title: 'Intersection of Two Arrays',
            slug: 'intersection-of-two-arrays',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/intersection-of-two-arrays/',
            order: 3
          }
        ]
      },
      {
        id: 'hashmap',
        title: 'HashMap',
        explanation: 'Learn key-value mapping to store associated information (e.g. value -> index, or character -> count).',
        recognitionClues: 'Find complement value, count frequencies, map character transformations, group items by key.',
        basicIdea: 'Use a Map where key is the item and value is its count or index. Lookup required complementary values in O(1) time.',
        problems: [
          {
            title: 'Two Sum',
            slug: 'two-sum',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
            order: 1
          },
          {
            title: 'Majority Element',
            slug: 'majority-element',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/majority-element/',
            order: 2
          },
          {
            title: 'Isomorphic Strings',
            slug: 'isomorphic-strings',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/isomorphic-strings/',
            order: 3
          },
          {
            title: 'Group Anagrams',
            slug: 'group-anagrams',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/',
            order: 4
          }
        ]
      }
    ]
  },
  {
    id: 'stage-4',
    title: 'STAGE 4 — TWO POINTERS',
    topics: [
      {
        id: 'two-pointers',
        title: 'Two Pointers',
        explanation: 'Use two pointers starting at opposite ends (or moving at different speeds) to process sorted arrays or strings in linear O(N) time.',
        recognitionClues: 'Sorted array, pair sum, opposite ends, left/right pointers, remove duplicates, container area.',
        basicIdea: 'Initialize left = 0 and right = n - 1. Calculate metric; if too small increment left, if too large decrement right.',
        problems: [
          {
            title: 'Valid Palindrome',
            slug: 'valid-palindrome',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
            order: 1
          },
          {
            title: 'Two Sum II - Input Array Is Sorted',
            slug: 'two-sum-ii-input-array-is-sorted',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
            order: 2
          },
          {
            title: 'Remove Duplicates from Sorted Array',
            slug: 'remove-duplicates-from-sorted-array',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
            order: 3
          },
          {
            title: 'Container With Most Water',
            slug: 'container-with-most-water',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/',
            order: 4
          },
          {
            title: '3Sum',
            slug: '3sum',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/3sum/',
            order: 5
          }
        ]
      }
    ]
  },
  {
    id: 'stage-5',
    title: 'STAGE 5 — SLIDING WINDOW',
    topics: [
      {
        id: 'fixed-window',
        title: 'Fixed Window',
        explanation: 'Maintain a contiguous subarray/substring window of fixed size K as it slides across the array.',
        recognitionClues: 'Subarray of size K, maximum average of length K, window size constant.',
        basicIdea: 'Compute initial window metric for first K elements. Slide window by adding right element and subtracting left element.',
        problems: [
          {
            title: 'Maximum Average Subarray I',
            slug: 'maximum-average-subarray-i',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/maximum-average-subarray-i/',
            order: 1
          },
          {
            title: 'Maximum Number of Vowels in a Substring of Given Length',
            slug: 'maximum-number-of-vowels-in-a-substring-of-given-length',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/',
            order: 2
          }
        ]
      },
      {
        id: 'variable-window',
        title: 'Variable Window',
        explanation: 'Dynamically expand and shrink a window based on problem constraints (Expand -> Check -> Shrink).',
        recognitionClues: 'Longest/shortest subarray or substring matching a condition, at most K distinct elements.',
        basicIdea: 'Expand right pointer to include elements. When condition is violated, shrink left pointer until condition holds again.',
        problems: [
          {
            title: 'Longest Substring Without Repeating Characters',
            slug: 'longest-substring-without-repeating-characters',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
            order: 1
          },
          {
            title: 'Minimum Size Subarray Sum',
            slug: 'minimum-size-subarray-sum',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/minimum-size-subarray-sum/',
            order: 2
          },
          {
            title: 'Longest Repeating Character Replacement',
            slug: 'longest-repeating-character-replacement',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
            order: 3
          }
        ]
      }
    ]
  },
  {
    id: 'stage-6',
    title: 'STAGE 6 — PREFIX SUM',
    topics: [
      {
        id: 'prefix-sum',
        title: 'Prefix Sum',
        explanation: 'Precompute cumulative running totals to answer range sum queries (sum from index i to j) in O(1) time.',
        recognitionClues: 'Multiple range sum queries, subarray sum equals target, pivot index where left sum equals right sum.',
        basicIdea: 'Build array prefix where prefix[i] = sum(nums[0..i-1]). Range sum(i, j) = prefix[j+1] - prefix[i].',
        problems: [
          {
            title: 'Find Pivot Index',
            slug: 'find-pivot-index',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/find-pivot-index/',
            order: 1
          },
          {
            title: 'Range Sum Query - Immutable',
            slug: 'range-sum-query-immutable',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/range-sum-query-immutable/',
            order: 2
          },
          {
            title: 'Subarray Sum Equals K',
            slug: 'subarray-sum-equals-k',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/',
            order: 3
          }
        ]
      }
    ]
  },
  {
    id: 'stage-7',
    title: 'STAGE 7 — SORTING + GREEDY',
    topics: [
      {
        id: 'sorting-strategy',
        title: 'Sorting as a Strategy',
        explanation: 'Transform unsorted data into sorted order to simplify matching, interval merging, and decision-making.',
        recognitionClues: 'Overlapping intervals, content assignment, organizing elements to make simple sequential decisions.',
        basicIdea: 'Sort the array first. Then iterate sequentially making straightforward decisions.',
        problems: [
          {
            title: 'Assign Cookies',
            slug: 'assign-cookies',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/assign-cookies/',
            order: 1
          },
          {
            title: 'Merge Intervals',
            slug: 'merge-intervals',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/',
            order: 2
          },
          {
            title: 'Sort Colors',
            slug: 'sort-colors',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/sort-colors/',
            order: 3
          }
        ]
      },
      {
        id: 'greedy-thinking',
        title: 'Greedy Thinking',
        explanation: 'Make the locally optimal choice at each step with the goal of finding a globally optimal solution.',
        recognitionClues: 'Buy/sell stock for max profit, jump game reachable check, gas station circular route.',
        basicIdea: 'Keep track of best choice so far (e.g. min price seen so far) and update global answer greedily.',
        problems: [
          {
            title: 'Best Time to Buy and Sell Stock',
            slug: 'best-time-to-buy-and-sell-stock',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
            order: 1
          },
          {
            title: 'Jump Game',
            slug: 'jump-game',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/jump-game/',
            order: 2
          },
          {
            title: 'Gas Station',
            slug: 'gas-station',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/gas-station/',
            order: 3
          }
        ]
      }
    ]
  },
  {
    id: 'stage-8',
    title: 'STAGE 8 — STACK',
    topics: [
      {
        id: 'stack-basics',
        title: 'Stack Basics',
        explanation: 'Master the Last In, First Out (LIFO) data structure for nested matching and undo operations.',
        recognitionClues: 'Parentheses matching, nested structures, undoing previous operations, score calculation.',
        basicIdea: 'Push elements onto stack when encountering opening signals; pop when encountering closing signals.',
        problems: [
          {
            title: 'Valid Parentheses',
            slug: 'valid-parentheses',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
            order: 1
          },
          {
            title: 'Baseball Game',
            slug: 'baseball-game',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/baseball-game/',
            order: 2
          },
          {
            title: 'Min Stack',
            slug: 'min-stack',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/min-stack/',
            order: 3
          }
        ]
      },
      {
        id: 'monotonic-stack-intro',
        title: 'Monotonic Stack Introduction',
        explanation: 'Use a stack maintaining elements in monotonic order to quickly find the next greater or smaller element.',
        recognitionClues: 'Next greater element, daily temperatures (days until warmer temperature), stock span.',
        basicIdea: 'Maintain stack indices/values in increasing or decreasing order. Pop smaller elements when a larger element arrives.',
        problems: [
          {
            title: 'Daily Temperatures',
            slug: 'daily-temperatures',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/daily-temperatures/',
            order: 1
          },
          {
            title: 'Next Greater Element I',
            slug: 'next-greater-element-i',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/next-greater-element-i/',
            order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'stage-9',
    title: 'STAGE 9 — BINARY SEARCH',
    topics: [
      {
        id: 'basic-binary-search',
        title: 'Basic Binary Search',
        explanation: 'Search sorted arrays in logarithmic O(log N) time by repeatedly halving the search space.',
        recognitionClues: 'Sorted array, search in O(log N), search insertion target, bad version boundary.',
        basicIdea: 'Calculate mid = left + (right - left)/2. If target == nums[mid] return mid; adjust left or right accordingly.',
        problems: [
          {
            title: 'Binary Search',
            slug: 'binary-search',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/binary-search/',
            order: 1
          },
          {
            title: 'Search Insert Position',
            slug: 'search-insert-position',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/search-insert-position/',
            order: 2
          },
          {
            title: 'First Bad Version',
            slug: 'first-bad-version',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/first-bad-version/',
            order: 3
          }
        ]
      },
      {
        id: 'binary-search-variations',
        title: 'Binary Search Variations',
        explanation: 'Apply binary search to rotated sorted arrays, lower/upper bound searches, and monotonic search spaces.',
        recognitionClues: 'Rotated sorted array, first and last occurrence of element, minimum in rotated array.',
        basicIdea: 'Determine which half of the search space is monotonically sorted and discard the unsorted half.',
        problems: [
          {
            title: 'Find First and Last Position of Element in Sorted Array',
            slug: 'find-first-and-last-position-of-element-in-sorted-array',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/',
            order: 1
          },
          {
            title: 'Search in Rotated Sorted Array',
            slug: 'search-in-rotated-sorted-array',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
            order: 2
          },
          {
            title: 'Find Minimum in Rotated Sorted Array',
            slug: 'find-minimum-in-rotated-sorted-array',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
            order: 3
          }
        ]
      }
    ]
  },
  {
    id: 'stage-10',
    title: 'STAGE 10 — LINKED LIST',
    topics: [
      {
        id: 'linked-list-basics',
        title: 'Linked List Basics',
        explanation: 'Understand nodes, head, tail, next pointers, node traversal, and linked list reversal.',
        recognitionClues: 'Node manipulations, list reversal, middle of list, node deletion.',
        basicIdea: 'Maintain pointer references carefully. Use dummy head nodes to simplify boundary cases.',
        problems: [
          {
            title: 'Design Linked List',
            slug: 'design-linked-list',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/design-linked-list/',
            order: 1
          },
          {
            title: 'Middle of the Linked List',
            slug: 'middle-of-the-linked-list',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/middle-of-the-linked-list/',
            order: 2
          },
          {
            title: 'Reverse Linked List',
            slug: 'reverse-linked-list',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
            order: 3
          }
        ]
      },
      {
        id: 'fast-and-slow-pointers',
        title: 'Fast and Slow Pointers',
        explanation: 'Use two pointers moving at different speeds (1 step vs 2 steps) for cycle detection and distance calculations.',
        recognitionClues: 'Cycle detection, Floyd tortoise & hare, N-th node from end, intersection point.',
        basicIdea: 'Move slow pointer by 1 step and fast pointer by 2 steps. If fast meets slow, a cycle exists.',
        problems: [
          {
            title: 'Linked List Cycle',
            slug: 'linked-list-cycle',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/',
            order: 1
          },
          {
            title: 'Remove Nth Node From End of List',
            slug: 'remove-nth-node-from-end-of-list',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
            order: 2
          },
          {
            title: 'Intersection of Two Linked Lists',
            slug: 'intersection-of-two-linked-lists',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/intersection-of-two-linked-lists/',
            order: 3
          }
        ]
      }
    ]
  },
  {
    id: 'stage-11',
    title: 'STAGE 11 — QUEUE + BFS THINKING',
    topics: [
      {
        id: 'queue-basics',
        title: 'Queue Basics',
        explanation: 'Understand First In, First Out (FIFO) data structures and basic queue simulation before Breadth-First Search.',
        recognitionClues: 'First In First Out processing, sliding time-window requests, implementing queue using stacks.',
        basicIdea: 'Push to back, pop from front. Useful when items must be processed strictly in arrival order.',
        problems: [
          {
            title: 'Number of Recent Calls',
            slug: 'number-of-recent-calls',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/number-of-recent-calls/',
            order: 1
          },
          {
            title: 'Implement Queue using Stacks',
            slug: 'implement-queue-using-stacks',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/implement-queue-using-stacks/',
            order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'stage-12',
    title: 'STAGE 12 — RECURSION',
    topics: [
      {
        id: 'recursion-basics',
        title: 'Recursion',
        explanation: 'Master breaking problems into smaller instances of the same problem using base cases and call stacks.',
        recognitionClues: 'Divide and conquer, recurrence relations, Fibonacci sequences, stepping staircases.',
        basicIdea: '1) Identify base case (stopping condition). 2) Perform recursive call on smaller subproblem.',
        problems: [
          {
            title: 'Fibonacci Number',
            slug: 'fibonacci-number',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/fibonacci-number/',
            order: 1
          },
          {
            title: 'Power of Two',
            slug: 'power-of-two',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/power-of-two/',
            order: 2
          },
          {
            title: 'Climbing Stairs',
            slug: 'climbing-stairs',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
            order: 3
          }
        ]
      }
    ]
  },
  {
    id: 'stage-13',
    title: 'STAGE 13 — TREES',
    topics: [
      {
        id: 'binary-tree-basics',
        title: 'Binary Tree Basics',
        explanation: 'Learn tree terminology (root, leaf, height) and Depth-First Search (preorder, inorder, postorder).',
        recognitionClues: 'Tree max depth, check if identical trees, invert binary tree, preorder traversal.',
        basicIdea: 'Recursively process left and right child subtrees and aggregate tree metrics at the root node.',
        problems: [
          {
            title: 'Maximum Depth of Binary Tree',
            slug: 'maximum-depth-of-binary-tree',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
            order: 1
          },
          {
            title: 'Same Tree',
            slug: 'same-tree',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/same-tree/',
            order: 2
          },
          {
            title: 'Invert Binary Tree',
            slug: 'invert-binary-tree',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/',
            order: 3
          },
          {
            title: 'Binary Tree Preorder Traversal',
            slug: 'binary-tree-preorder-traversal',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/binary-tree-preorder-traversal/',
            order: 4
          }
        ]
      },
      {
        id: 'tree-dfs-bfs',
        title: 'Tree DFS / BFS',
        explanation: 'Explore level-order traversal (queue-based BFS) and path property computations (DFS).',
        recognitionClues: 'Level order traversal, tree diameter, balanced tree verification, root-to-leaf path sum.',
        basicIdea: 'Use queue for level-by-level BFS. Use recursion returning subtree heights/sums for path DFS.',
        problems: [
          {
            title: 'Binary Tree Level Order Traversal',
            slug: 'binary-tree-level-order-traversal',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
            order: 1
          },
          {
            title: 'Diameter of Binary Tree',
            slug: 'diameter-of-binary-tree',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/',
            order: 2
          },
          {
            title: 'Balanced Binary Tree',
            slug: 'balanced-binary-tree',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/balanced-binary-tree/',
            order: 3
          },
          {
            title: 'Path Sum',
            slug: 'path-sum',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/path-sum/',
            order: 4
          }
        ]
      },
      {
        id: 'binary-search-tree',
        title: 'Binary Search Tree',
        explanation: 'Leverage BST properties (Left < Node < Right) for fast searching and ancestor finding.',
        recognitionClues: 'Search in BST, validate BST, lowest common ancestor in BST.',
        basicIdea: 'Exploit binary search ordering: if target < node.val search left subtree, else search right subtree.',
        problems: [
          {
            title: 'Search in a Binary Search Tree',
            slug: 'search-in-a-binary-search-tree',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/search-in-a-binary-search-tree/',
            order: 1
          },
          {
            title: 'Validate Binary Search Tree',
            slug: 'validate-binary-search-tree',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/',
            order: 2
          },
          {
            title: 'Lowest Common Ancestor of a Binary Search Tree',
            slug: 'lowest-common-ancestor-of-a-binary-search-tree',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
            order: 3
          }
        ]
      }
    ]
  },
  {
    id: 'stage-14',
    title: 'STAGE 14 — HEAP / PRIORITY QUEUE',
    topics: [
      {
        id: 'heap-basics',
        title: 'Heap Basics',
        explanation: 'Use Min-Heap and Max-Heap priority queues for efficiently tracking top K largest/smallest items in O(N log K) time.',
        recognitionClues: 'Kth largest element, top K frequent items, K closest points, dynamically finding min/max.',
        basicIdea: 'Maintain a min-heap of size K. When size exceeds K, pop the smallest element.',
        problems: [
          {
            title: 'Kth Largest Element in an Array',
            slug: 'kth-largest-element-in-an-array',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
            order: 1
          },
          {
            title: 'Last Stone Weight',
            slug: 'last-stone-weight',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/last-stone-weight/',
            order: 2
          },
          {
            title: 'Top K Frequent Elements',
            slug: 'top-k-frequent-elements',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/',
            order: 3
          },
          {
            title: 'K Closest Points to Origin',
            slug: 'k-closest-points-to-origin',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/k-closest-points-to-origin/',
            order: 4
          }
        ]
      }
    ]
  },
  {
    id: 'stage-15',
    title: 'STAGE 15 — GRAPHS',
    topics: [
      {
        id: 'graph-basics',
        title: 'Graph Basics',
        explanation: 'Understand adjacency list representation, nodes, edges, and visited node tracking.',
        recognitionClues: 'Star graph center, path existence in graph, connected component counts (provinces).',
        basicIdea: 'Represent connections using Map<Node, List<Neighbors>> and keep a Visited set to prevent infinite loops.',
        problems: [
          {
            title: 'Find Center of Star Graph',
            slug: 'find-center-of-star-graph',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/find-center-of-star-graph/',
            order: 1
          },
          {
            title: 'Find if Path Exists in Graph',
            slug: 'find-if-path-exists-in-graph',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/find-if-path-exists-in-graph/',
            order: 2
          },
          {
            title: 'Number of Provinces',
            slug: 'number-of-provinces',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/number-of-provinces/',
            order: 3
          }
        ]
      },
      {
        id: 'graph-dfs-bfs',
        title: 'Graph DFS / BFS',
        explanation: 'Traverse grid matrices and network graphs using Depth-First Search and Breadth-First Search.',
        recognitionClues: 'Flood fill grid, island counts (connected 2D grid), grid infection (rotting oranges), graph cloning.',
        basicIdea: 'Scan grid cell by cell. On unvisited land/target cell, trigger DFS/BFS to visit all connected neighbor cells.',
        problems: [
          {
            title: 'Flood Fill',
            slug: 'flood-fill',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/flood-fill/',
            order: 1
          },
          {
            title: 'Number of Islands',
            slug: 'number-of-islands',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/',
            order: 2
          },
          {
            title: 'Clone Graph',
            slug: 'clone-graph',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/clone-graph/',
            order: 3
          },
          {
            title: 'Rotting Oranges',
            slug: 'rotting-oranges',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/rotting-oranges/',
            order: 4
          }
        ]
      },
      {
        id: 'graph-shortest-path',
        title: 'Graph Shortest Path',
        explanation: 'Find shortest paths in unweighted (BFS) and weighted (Dijkstra) graphs.',
        recognitionClues: 'Shortest path in matrix, minimum steps/time to reach destination (network delay).',
        basicIdea: 'Use queue-based BFS for unweighted unit-step grids. Use priority-queue (Dijkstra) for weighted edges.',
        problems: [
          {
            title: 'Shortest Path in Binary Matrix',
            slug: 'shortest-path-in-binary-matrix',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/',
            order: 1
          },
          {
            title: 'Network Delay Time',
            slug: 'network-delay-time',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/network-delay-time/',
            order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'stage-16',
    title: 'STAGE 16 — BACKTRACKING',
    topics: [
      {
        id: 'backtracking',
        title: 'Backtracking',
        explanation: 'Systematically explore all potential decision trees by choosing an option, exploring recursively, and undoing the choice (Choose -> Explore -> Undo).',
        recognitionClues: 'Find all subsets, permutations, combination sums, phone number letter combinations.',
        basicIdea: 'Maintain a current path array. Append candidate -> recurse -> pop candidate to backtrack.',
        problems: [
          {
            title: 'Subsets',
            slug: 'subsets',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/subsets/',
            order: 1
          },
          {
            title: 'Permutations',
            slug: 'permutations',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/permutations/',
            order: 2
          },
          {
            title: 'Combination Sum',
            slug: 'combination-sum',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/combination-sum/',
            order: 3
          },
          {
            title: 'Letter Combinations of a Phone Number',
            slug: 'letter-combinations-of-a-phone-number',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/',
            order: 4
          }
        ]
      }
    ]
  },
  {
    id: 'stage-17',
    title: 'STAGE 17 — DYNAMIC PROGRAMMING',
    topics: [
      {
        id: 'dp-1d',
        title: '1D Dynamic Programming',
        explanation: 'Solve optimization and counting problems with overlapping subproblems by memoizing 1D state transitions.',
        recognitionClues: 'Climbing stairs, min cost climbing, house robber (non-adjacent choices).',
        basicIdea: 'Define dp[i] state. Establish base cases (dp[0], dp[1]). Compute dp[i] from previously stored dp[i-1], dp[i-2].',
        problems: [
          {
            title: 'Climbing Stairs',
            slug: 'climbing-stairs',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
            order: 1
          },
          {
            title: 'Min Cost Climbing Stairs',
            slug: 'min-cost-climbing-stairs',
            difficulty: 'EASY',
            leetcodeUrl: 'https://leetcode.com/problems/min-cost-climbing-stairs/',
            order: 2
          },
          {
            title: 'House Robber',
            slug: 'house-robber',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/house-robber/',
            order: 3
          },
          {
            title: 'House Robber II',
            slug: 'house-robber-ii',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/',
            order: 4
          }
        ]
      },
      {
        id: 'dp-2d',
        title: '2D Dynamic Programming',
        explanation: 'Process grid paths, string sequence alignments, and coin combinations using 2D state tables.',
        recognitionClues: 'Unique paths in grid, longest common subsequence between two strings, coin change, word break.',
        basicIdea: 'Define dp[i][j] representing subproblem up to index i and j. Fill table iteratively or use memoized DFS.',
        problems: [
          {
            title: 'Unique Paths',
            slug: 'unique-paths',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/unique-paths/',
            order: 1
          },
          {
            title: 'Longest Common Subsequence',
            slug: 'longest-common-subsequence',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/',
            order: 2
          },
          {
            title: 'Coin Change',
            slug: 'coin-change',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/coin-change/',
            order: 3
          },
          {
            title: 'Word Break',
            slug: 'word-break',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/word-break/',
            order: 4
          }
        ]
      }
    ]
  },
  {
    id: 'stage-18',
    title: 'STAGE 18 — INTERVIEW PREPARATION',
    topics: [
      {
        id: 'mixed-pattern-problems',
        title: 'Mixed Pattern Problems',
        explanation: 'Test your pattern recognition without explicit topic clues by solving mixed interview-style problems.',
        recognitionClues: 'Synthesize Arrays, Hashing, Two Pointers, Window, Stack, Binary Search, Trees, Graphs, DP.',
        basicIdea: 'Analyze problem constraints and requirements first to pick the optimal pattern before writing code.',
        problems: [
          {
            title: 'Product of Array Except Self',
            slug: 'product-of-array-except-self',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
            order: 1
          },
          {
            title: 'Trapping Rain Water',
            slug: 'trapping-rain-water',
            difficulty: 'HARD',
            leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
            order: 2
          },
          {
            title: 'LRU Cache',
            slug: 'lru-cache',
            difficulty: 'MEDIUM',
            leetcodeUrl: 'https://leetcode.com/problems/lru-cache/',
            order: 3
          },
          {
            title: 'Merge k Sorted Lists',
            slug: 'merge-k-sorted-lists',
            difficulty: 'HARD',
            leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/',
            order: 4
          }
        ]
      }
    ]
  }
];

module.exports = dsaRoadmap;
