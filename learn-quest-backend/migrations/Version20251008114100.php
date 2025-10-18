<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251008114100 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE lesson_section_answer ADD initial_correct TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE question_option DROP FOREIGN KEY FK_C6F6759AD52AAAAB');
        $this->addSql('DROP INDEX idx_c6f6759ad52aaaab ON question_option');
        $this->addSql('CREATE INDEX IDX_5DDB2FB8D52AAAAB ON question_option (lesson_section_id)');
        $this->addSql('ALTER TABLE question_option ADD CONSTRAINT FK_C6F6759AD52AAAAB FOREIGN KEY (lesson_section_id) REFERENCES lesson_section (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE question_option DROP FOREIGN KEY FK_5DDB2FB8D52AAAAB');
        $this->addSql('DROP INDEX idx_5ddb2fb8d52aaaab ON question_option');
        $this->addSql('CREATE INDEX IDX_C6F6759AD52AAAAB ON question_option (lesson_section_id)');
        $this->addSql('ALTER TABLE question_option ADD CONSTRAINT FK_5DDB2FB8D52AAAAB FOREIGN KEY (lesson_section_id) REFERENCES lesson_section (id)');
        $this->addSql('ALTER TABLE lesson_section_answer DROP initial_correct');
    }
}
