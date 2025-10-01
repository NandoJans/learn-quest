<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration to add question fields to lesson_section and create lesson_section_answer table
 */
final class Version20250101000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add question fields to lesson_section and create lesson_section_answer table';
    }

    public function up(Schema $schema): void
    {
        // Add question fields to lesson_section
        $this->addSql('ALTER TABLE lesson_section ADD question_prompt LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE lesson_section ADD question_input_type VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE lesson_section ADD question_answers JSON DEFAULT NULL');
        $this->addSql('ALTER TABLE lesson_section ADD question_correct_answer LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE lesson_section ADD question_explanation LONGTEXT DEFAULT NULL');

        // Create lesson_section_answer table
        $this->addSql('CREATE TABLE lesson_section_answer (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            lesson_section_id INT NOT NULL,
            answer LONGTEXT DEFAULT NULL,
            is_correct TINYINT(1) NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_LSA_USER (user_id),
            INDEX IDX_LSA_SECTION (lesson_section_id),
            UNIQUE INDEX UNIQ_LSA_USER_SECTION (user_id, lesson_section_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE lesson_section_answer ADD CONSTRAINT FK_LSA_USER FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE lesson_section_answer ADD CONSTRAINT FK_LSA_SECTION FOREIGN KEY (lesson_section_id) REFERENCES lesson_section (id)');
    }

    public function down(Schema $schema): void
    {
        // Drop lesson_section_answer table
        $this->addSql('ALTER TABLE lesson_section_answer DROP FOREIGN KEY FK_LSA_USER');
        $this->addSql('ALTER TABLE lesson_section_answer DROP FOREIGN KEY FK_LSA_SECTION');
        $this->addSql('DROP TABLE lesson_section_answer');

        // Remove question fields from lesson_section
        $this->addSql('ALTER TABLE lesson_section DROP question_prompt');
        $this->addSql('ALTER TABLE lesson_section DROP question_input_type');
        $this->addSql('ALTER TABLE lesson_section DROP question_answers');
        $this->addSql('ALTER TABLE lesson_section DROP question_correct_answer');
        $this->addSql('ALTER TABLE lesson_section DROP question_explanation');
    }
}
