<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>rGameEngine - Project Hub</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            color: white;
            padding: 40px 0;
        }
        
        header h1 {
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 25px;
            margin-top: 40px;
        }
        
        .project-card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
        }
        
        .project-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0,0,0,0.2);
        }
        
        .project-card h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        
        .project-card p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        
        .project-link {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            transition: opacity 0.3s ease;
        }
        
        .project-link:hover {
            opacity: 0.9;
        }
        
        .no-projects {
            background: white;
            border-radius: 10px;
            padding: 40px;
            text-align: center;
            color: #666;
        }
        
        .no-projects h2 {
            color: #667eea;
            margin-bottom: 15px;
        }
        
        .project-count {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎮 rGameEngine</h1>
            <p>A free web-based game engine - Project Hub</p>
        </header>
        
        <?php
        // Define the submissions folder path
        $submissionsFolder = __DIR__ . '/submissions';
        
        // Create submissions folder if it doesn't exist
        if (!file_exists($submissionsFolder)) {
            @mkdir($submissionsFolder, 0755, true);
        }
        
        // Scan the submissions folder for project directories
        $projects = array();
        
        if (is_dir($submissionsFolder)) {
            $items = scandir($submissionsFolder);
            
            foreach ($items as $item) {
                // Skip . and .. directories
                if ($item === '.' || $item === '..') {
                    continue;
                }
                
                $itemPath = $submissionsFolder . '/' . $item;
                
                // Only include directories
                if (is_dir($itemPath)) {
                    $projectInfo = array(
                        'name' => $item,
                        'path' => 'submissions/' . $item,
                        'description' => '',
                        'hasIndex' => false
                    );
                    
                    // Check for a description file
                    $descFile = $itemPath . '/description.txt';
                    if (file_exists($descFile)) {
                        $content = @file_get_contents($descFile);
                        if ($content !== false) {
                            $projectInfo['description'] = trim($content);
                        }
                    }
                    
                    // Check if project has an index file
                    $indexHtml = $itemPath . '/index.html';
                    $indexPhp = $itemPath . '/index.php';
                    if (file_exists($indexHtml)) {
                        $projectInfo['hasIndex'] = true;
                        $projectInfo['indexFile'] = 'index.html';
                    } elseif (file_exists($indexPhp)) {
                        $projectInfo['hasIndex'] = true;
                        $projectInfo['indexFile'] = 'index.php';
                    }
                    
                    $projects[] = $projectInfo;
                }
            }
        }
        
        // Sort projects alphabetically by name
        usort($projects, function($a, $b) {
            return strcmp($a['name'], $b['name']);
        });
        
        // Display project count
        $projectCount = count($projects);
        echo '<div style="text-align: center;">';
        echo '<div class="project-count">';
        echo $projectCount . ' Project' . ($projectCount !== 1 ? 's' : '') . ' Found';
        echo '</div>';
        echo '</div>';
        ?>
        
        <div class="projects-grid">
            <?php
            if (empty($projects)) {
                echo '<div class="no-projects" style="grid-column: 1 / -1;">';
                echo '<h2>No Projects Yet</h2>';
                echo '<p>Create a new folder in the <code>submissions/</code> directory to add your first project.</p>';
                echo '<p>You can optionally add a <code>description.txt</code> file to provide more information about your project.</p>';
                echo '</div>';
            } else {
                foreach ($projects as $project) {
                    echo '<div class="project-card">';
                    echo '<h2>' . htmlspecialchars($project['name']) . '</h2>';
                    
                    if (!empty($project['description'])) {
                        echo '<p>' . nl2br(htmlspecialchars($project['description'])) . '</p>';
                    } else {
                        echo '<p>No description available.</p>';
                    }
                    
                    if ($project['hasIndex']) {
                        echo '<a href="' . htmlspecialchars($project['path']) . '/' . htmlspecialchars($project['indexFile']) . '" class="project-link">Open Project →</a>';
                    } else {
                        echo '<a href="' . htmlspecialchars($project['path']) . '/" class="project-link">Browse Files →</a>';
                    }
                    
                    echo '</div>';
                }
            }
            ?>
        </div>
    </div>
</body>
</html>
