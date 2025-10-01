<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add question fields to lesson_section table and create question_option table
 */
final class Version20250102000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add question fields to lesson_section and create question_option table';
    }

    public function up(Schema $schema): void
    {
        // Add question fields to lesson_section
        $this->addSql('ALTER TABLE lesson_section ADD question_prompt LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE lesson_section ADD question_type VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE lesson_section ADD question_explanation LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE lesson_section ADD correct_answer LONGTEXT DEFAULT NULL');

        // Create question_option table
        $this->addSql('CREATE TABLE question_option (id INT AUTO_INCREMENT NOT NULL, lesson_section_id INT NOT NULL, option_text LONGTEXT NOT NULL, position INT NOT NULL, INDEX IDX_C6F6759AD52AAAAB (lesson_section_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE question_option ADD CONSTRAINT FK_C6F6759AD52AAAAB FOREIGN KEY (lesson_section_id) REFERENCES lesson_section (id)');
    }

    public function postUp(Schema $schema): void
    {
        // Migrate existing JSON question data to new fields
        $connection = $this->connection;
        
        // Get all question-type sections
        $sections = $connection->fetchAllAssociative(
            "SELECT id, content FROM lesson_section WHERE type = 'question' AND content IS NOT NULL AND content != ''"
        );
        
        foreach ($sections as $section) {
            $content = $section['content'];
            $data = json_decode($content, true);
            
            if (!is_array($data)) {
                continue;
            }
            
            $sectionId = $section['id'];
            $prompt = $data['prompt'] ?? '';
            $explanation = $data['explanation'] ?? '';
            $answers = $data['answers'] ?? [];
            $correctIndex = $data['correctIndex'] ?? null;
            
            // Update the section with new fields
            $connection->executeStatement(
                'UPDATE lesson_section SET question_prompt = ?, question_type = ?, question_explanation = ?, correct_answer = ? WHERE id = ?',
                [$prompt, 'radio', $explanation, $correctIndex !== null ? (string)$correctIndex : null, $sectionId]
            );
            
            // Insert question options
            foreach ($answers as $position => $answerText) {
                $connection->executeStatement(
                    'INSERT INTO question_option (lesson_section_id, option_text, position) VALUES (?, ?, ?)',
                    [$sectionId, $answerText, $position]
                );
            }
            
            // Clear the old JSON content
            $connection->executeStatement(
                'UPDATE lesson_section SET content = ? WHERE id = ?',
                ['', $sectionId]
            );
        }
    }

    public function down(Schema $schema): void
    {
        // Drop question_option table
        $this->addSql('ALTER TABLE question_option DROP FOREIGN KEY FK_C6F6759AD52AAAAB');
        $this->addSql('DROP TABLE question_option');

        // Remove question fields from lesson_section
        $this->addSql('ALTER TABLE lesson_section DROP question_prompt');
        $this->addSql('ALTER TABLE lesson_section DROP question_type');
        $this->addSql('ALTER TABLE lesson_section DROP question_explanation');
        $this->addSql('ALTER TABLE lesson_section DROP correct_answer');
    }
}
