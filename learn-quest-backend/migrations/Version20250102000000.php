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
